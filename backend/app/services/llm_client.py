import httpx
from typing import Optional, Dict, Any
import json

from app.config import settings

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
        temperature: float = 0.7,
        max_tokens: int = 2000
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
                raise Exception(f"Ollama API error: {str(e)}")

    async def generate_with_context(
        self,
        query: str,
        context_chunks: list[str],
        generate_diagram: bool = True
    ) -> Dict[str, Any]:
        """Generate response with RAG context and optional Mermaid diagram"""

        # Build context from retrieved chunks
        context = "\n\n---\n\n".join(context_chunks)

        # System prompt for educational assistance
        system_prompt = """You are Guru-Agent, an empathetic AI learning companion. Your role is to:
1. Help students understand concepts deeply, not just provide answers
2. Use the Socratic method when appropriate
3. Break down complex topics into digestible steps
4. Encourage critical thinking

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

Provide a clear, educational explanation. If this involves a process, workflow, or structure, include a Mermaid diagram at the end."""

        # Generate response
        response = await self.generate(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=0.7
        )

        # Extract Mermaid diagram if present
        mermaid_diagram = None
        if "```mermaid" in response:
            try:
                start = response.find("```mermaid") + 10
                end = response.find("```", start)
                mermaid_diagram = response[start:end].strip()
            except Exception:
                pass  # Diagram extraction failed, continue without it

        return {
            "response": response,
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
