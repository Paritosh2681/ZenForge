"""
Phase 4: Protege Effect Router
AI plays a confused student, user teaches it. AI grades teaching quality.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging

from app.services.llm_client import OllamaClient
from app.services.vector_store import VectorStore

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/protege", tags=["protege-effect"])

llm_client = OllamaClient()

class ProtegeStartRequest(BaseModel):
    topic: Optional[str] = None
    difficulty: str = "medium"  # easy, medium, hard

class ProtegeMessageRequest(BaseModel):
    session_topic: str
    user_explanation: str
    conversation_history: List[dict] = []

class ProtegeEvalRequest(BaseModel):
    session_topic: str
    conversation_history: List[dict]

@router.post("/start")
async def start_protege_session(request: ProtegeStartRequest):
    """Start a teach-back session where AI is the confused student"""
    try:
        # Get a topic from the knowledge base if not specified
        topic = request.topic
        if not topic:
            vs = VectorStore()
            chunks = vs.query("main concepts and topics", top_k=3)
            if chunks:
                prompt = f"From this text, identify ONE specific concept that would be good for a student to explain:\n{chunks[0]['content'][:500]}\n\nRespond with just the concept name, nothing else."
                topic = await llm_client.generate(prompt)
                topic = topic.strip().strip('"').strip("'")
            else:
                topic = "a topic from your study materials"

        confused_levels = {
            "easy": "You have a basic misunderstanding. Ask 1-2 simple clarifying questions.",
            "medium": "You are quite confused. Mix up related concepts. Ask 3-4 questions showing common misconceptions.",
            "hard": "You are very confused and have multiple fundamental misunderstandings. Challenge the teacher's explanations."
        }

        confusion = confused_levels.get(request.difficulty, confused_levels["medium"])

        opening_prompt = f"""You are a confused student trying to learn about "{topic}".
{confusion}
Generate your opening question showing your confusion. Be specific about what confuses you.
Respond in 1-2 sentences as the confused student. Start with something like "I'm trying to understand..." or "Can you explain..." """

        opening = await llm_client.generate(opening_prompt)

        return {
            "topic": topic,
            "difficulty": request.difficulty,
            "ai_message": opening.strip(),
            "instructions": f"You are now teaching about '{topic}'. Explain concepts clearly to help this confused student understand. The AI will evaluate your teaching quality."
        }
    except Exception as e:
        logger.error(f"Protege session start failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/respond")
async def protege_respond(request: ProtegeMessageRequest):
    """AI responds as confused student to user's teaching"""
    try:
        history_text = ""
        for msg in request.conversation_history[-6:]:
            role = "Student" if msg.get('role') == 'assistant' else "Teacher"
            history_text += f"{role}: {msg.get('content', '')}\n"

        prompt = f"""You are a confused student learning about "{request.session_topic}".
Previous conversation:
{history_text}

The teacher just said: "{request.user_explanation}"

Respond as the confused student. You can:
- Show growing understanding if the explanation was clear
- Ask follow-up questions about parts you still don't understand
- Relate it to something you know (possibly incorrectly)
- If you now understand, say so enthusiastically

Keep your response to 2-3 sentences. Stay in character as a student."""

        response = await llm_client.generate(prompt)

        return {
            "ai_message": response.strip(),
            "topic": request.session_topic
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate")
async def evaluate_teaching(request: ProtegeEvalRequest):
    """Evaluate the user's teaching quality"""
    try:
        history_text = ""
        for msg in request.conversation_history:
            role = "Student" if msg.get('role') == 'assistant' else "Teacher"
            history_text += f"{role}: {msg.get('content', '')}\n"

        prompt = f"""Evaluate this teaching session about "{request.session_topic}".

Conversation:
{history_text}

Rate the teaching quality on these criteria (each out of 10):
1. CLARITY: How clear were the explanations?
2. ACCURACY: Were the explanations factually correct?
3. ENGAGEMENT: Did the teacher respond well to student confusion?
4. DEPTH: How deep was the conceptual coverage?
5. EXAMPLES: Were good examples or analogies used?

Respond in this exact format:
CLARITY: [score]/10
ACCURACY: [score]/10
ENGAGEMENT: [score]/10
DEPTH: [score]/10
EXAMPLES: [score]/10
OVERALL: [total]/50
FEEDBACK: [2-3 sentences of constructive feedback]
STRENGTHS: [1-2 strengths]
IMPROVE: [1-2 areas to improve]"""

        result = await llm_client.generate(prompt)

        # Parse scores
        scores = {}
        feedback = ""
        strengths = ""
        improvements = ""

        for line in result.strip().split('\n'):
            line = line.strip()
            for key in ['CLARITY', 'ACCURACY', 'ENGAGEMENT', 'DEPTH', 'EXAMPLES', 'OVERALL']:
                if line.upper().startswith(key + ':'):
                    try:
                        val = line.split(':')[1].strip().split('/')[0].strip()
                        scores[key.lower()] = int(val)
                    except (ValueError, IndexError):
                        scores[key.lower()] = 5
            if line.upper().startswith('FEEDBACK:'):
                feedback = line.split(':', 1)[1].strip()
            if line.upper().startswith('STRENGTHS:'):
                strengths = line.split(':', 1)[1].strip()
            if line.upper().startswith('IMPROVE:'):
                improvements = line.split(':', 1)[1].strip()

        overall = scores.get('overall', sum(v for k, v in scores.items() if k != 'overall'))

        return {
            "scores": scores,
            "overall_score": overall,
            "max_score": 50,
            "percentage": round((overall / 50) * 100),
            "feedback": feedback,
            "strengths": strengths,
            "improvements": improvements,
            "grade": "A" if overall >= 45 else "B" if overall >= 35 else "C" if overall >= 25 else "D"
        }
    except Exception as e:
        logger.error(f"Teaching evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
