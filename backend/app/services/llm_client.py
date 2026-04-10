import httpx
from typing import Optional, Dict, Any, List, Tuple
import json
import logging
import re

from app.config import settings

logger = logging.getLogger(__name__)

MERMAID_DIAGRAM_PREFIXES = (
    "graph ",
    "flowchart ",
    "sequenceDiagram",
    "classDiagram",
    "stateDiagram",
    "stateDiagram-v2",
    "erDiagram",
    "journey",
    "gantt",
    "pie",
    "mindmap",
    "timeline",
    "gitGraph",
    "sankey-beta",
    "xychart-beta",
)

MERMAID_STOP_MARKERS = (
    "in this mermaid diagram",
    "sources:",
    "--- page",
    "relevance:",
    "ask a question",
    "send",
)

MERMAID_NOISE_PATTERNS = (
    r"^error:\s*parse error.*$",
    r"^parse error on line.*$",
    r"^expecting\s+['\"a-z0-9_ ,\-]+.*$",
    r"^mermaid\s+syntax\s+error.*$",
)


def _sanitize_mermaid(diagram_text: str) -> Optional[str]:
    """Normalize Mermaid text from imperfect model output."""
    if not diagram_text:
        return None

    lines = diagram_text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    cleaned_lines = []

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("```"):
            continue

        lower = line.lower()
        if any(marker in lower for marker in MERMAID_STOP_MARKERS):
            break

        cleaned_lines.append(line)

    if not cleaned_lines:
        return None

    first = cleaned_lines[0]
    if not first.startswith(MERMAID_DIAGRAM_PREFIXES):
        # Fall back to a simple flowchart when only node/edge fragments were returned.
        cleaned_lines.insert(0, "flowchart TD")

    return "\n".join(cleaned_lines).strip() or None


def _extract_mermaid(response_text: str) -> Tuple[Optional[str], str]:
    """Extract Mermaid block and return (diagram, response_without_diagram)."""
    if not response_text:
        return None, response_text

    def _clean_response_text(text: str) -> str:
        cleaned_lines = []
        for line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
            stripped = line.strip()
            if not stripped:
                cleaned_lines.append(line)
                continue

            lowered = stripped.lower()
            if lowered.startswith("```mermaid") or lowered == "```":
                continue

            if any(re.match(pattern, lowered) for pattern in MERMAID_NOISE_PATTERNS):
                continue

            cleaned_lines.append(line)

        return "\n".join(cleaned_lines).strip()

    fenced = re.search(r"```mermaid\s*([\s\S]*?)```", response_text, flags=re.IGNORECASE)
    if fenced:
        raw_diagram = fenced.group(1)
        cleaned_response = _clean_response_text(response_text[:fenced.start()] + response_text[fenced.end():])
        return _sanitize_mermaid(raw_diagram), cleaned_response

    lower = response_text.lower()
    start = lower.find("```mermaid")
    if start != -1:
        tail = response_text[start + len("```mermaid"):]
        end = tail.find("```")
        raw_diagram = tail[:end] if end != -1 else tail
        cleaned_response = _clean_response_text(response_text[:start])
        return _sanitize_mermaid(raw_diagram), cleaned_response

    return None, _clean_response_text(response_text)

class OllamaClient:
    """Client for local Ollama LLM inference"""

    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.model = settings.OLLAMA_MODEL
        self.timeout = httpx.Timeout(120.0, connect=10.0)

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.5,
        max_tokens: int = 1000
    ) -> str:
        """Generate completion from Ollama"""

        url = f"{self.base_url}/api/generate"

        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }

        if system_prompt:
            payload["system"] = system_prompt

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                result = response.json()
                return result.get("response", "")
            except httpx.HTTPError as e:
                logger.warning(f"Ollama unavailable, using fallback response: {e}")
                fallback = (
                    "I cannot reach the local Ollama model right now. "
                    "Please ensure Ollama is running and the configured model is pulled. "
                    "Meanwhile, I can still help based on available retrieved context from your documents."
                )
                return fallback

    async def generate_with_context(
        self,
        query: str,
        context_chunks: List[str],
        generate_diagram: bool = True,
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate response with RAG context and optional Mermaid diagram"""

        # Build context from retrieved chunks
        context = "\n\n---\n\n".join(context_chunks)

        # System prompt for educational assistance
        if not system_prompt:
            system_prompt = """You are Guru-Agent, an empathetic AI learning companion. Your role is to:
1. Help students understand concepts deeply, not just provide answers
2. Use the Socratic method when appropriate
3. Break down complex topics into digestible steps
4. Encourage critical thinking

CRITICAL RULES:
- ONLY answer using the provided "Context from study materials".
- If the answer cannot be found in the context, explicitly say "I do not have enough information in the provided context to answer this." Do not make up information.

When explaining processes, workflows, or hierarchical concepts, YOU MUST include a Mermaid.js diagram.
Format: End your response with:

```mermaid
[diagram code here]
```

Use appropriate diagram types:
- flowchart TD/LR for processes
- graph for relationships
- classDiagram for structures
- sequenceDiagram for interactions
"""

        # User prompt with context
        user_prompt = f"""Context from study materials:
{context}

Student Question: {query}

Provide a clear, educational explanation STRICTLY based on the context above. If this involves a process, workflow, or structure, include a Mermaid diagram at the end."""

        # Generate response - low temperature for strict context grounding
        response = await self.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.1,
            max_tokens=600
        )

        mermaid_diagram, cleaned_response = _extract_mermaid(response)

        return {
            "response": cleaned_response,
            "mermaid_diagram": mermaid_diagram
        }

    async def check_health(self) -> bool:
        """Check if Ollama is running and model is available"""
        url = f"{self.base_url}/api/tags"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                response.raise_for_status()
                models = response.json().get("models", [])

                # Check if configured model is available
                model_names = [m.get("name", "") for m in models]
                return any(self.model in name for name in model_names)
        except Exception:
            return False

# Alias for backward compatibility with topic_extractor.py
LLMClient = OllamaClient
