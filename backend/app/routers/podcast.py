"""
Phase 4: Podcast-style Audio Generation Router
Generate educational podcast conversations from uploaded notes
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
import uuid
import logging
import tempfile
import os

from app.services.llm_client import OllamaClient
from app.services.vector_store import VectorStore

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/podcast", tags=["podcast"])

llm_client = OllamaClient()

try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    logger.warning("pyttsx3 not available for podcast generation")

class PodcastRequest(BaseModel):
    topic: Optional[str] = "the uploaded study materials"
    duration: str = "short"  # short (2-3 min), medium (5 min), long (10 min)
    style: str = "educational"  # educational, debate, interview

class PodcastScript(BaseModel):
    title: str
    speakers: List[str]
    segments: List[dict]
    duration_estimate: str

@router.post("/generate-script")
async def generate_podcast_script(request: PodcastRequest):
    """Generate a podcast-style conversation script from study materials"""
    try:
        # Get context from vector store
        vs = VectorStore()
        chunks = vs.query(request.topic, top_k=6)

        if not chunks:
            raise HTTPException(status_code=400, detail="No study materials found. Upload documents first.")

        context = "\n\n".join([c['content'][:500] for c in chunks])

        length_guide = {"short": "4-6 exchanges", "medium": "8-12 exchanges", "long": "15-20 exchanges"}
        num_exchanges = length_guide.get(request.duration, "6-8 exchanges")

        prompt = f"""Generate a {request.style} podcast script between two speakers (Host and Expert) discussing the following study material.
Make it engaging, educational, and conversational. Include {num_exchanges}.

STUDY MATERIAL:
{context}

Format your response as a conversation. Each line should start with either "HOST:" or "EXPERT:" followed by their dialogue.
Make the Host ask insightful questions and the Expert give clear, detailed explanations.
Start with an introduction and end with a summary of key takeaways."""

        result = await llm_client.generate(prompt)

        # Parse the script into segments
        segments = []
        lines = result.strip().split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('HOST:'):
                segments.append({"speaker": "Host", "text": line[5:].strip()})
            elif line.startswith('EXPERT:'):
                segments.append({"speaker": "Expert", "text": line[7:].strip()})
            elif line and segments:
                segments[-1]["text"] += " " + line

        if not segments:
            # Fallback: treat entire response as a single segment
            segments = [{"speaker": "Host", "text": result[:len(result)//2]},
                       {"speaker": "Expert", "text": result[len(result)//2:]}]

        return {
            "title": f"Study Session: {request.topic[:50]}",
            "speakers": ["Host", "Expert"],
            "segments": segments,
            "duration_estimate": request.duration,
            "style": request.style,
            "segment_count": len(segments)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Script generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Script generation failed: {str(e)}")

@router.post("/synthesize")
async def synthesize_podcast(segments: List[dict]):
    """Convert podcast script segments to audio file"""
    if not TTS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Text-to-speech not available. Install pyttsx3.")

    try:
        engine = pyttsx3.init()
        voices = engine.getProperty('voices')

        # Create temp audio file
        output_path = os.path.join(tempfile.gettempdir(), f"podcast_{uuid.uuid4().hex[:8]}.wav")
        engine.save_to_file("", output_path)  # Initialize file

        for segment in segments:
            # Switch voice for different speakers
            if segment.get('speaker') == 'Expert' and len(voices) > 1:
                engine.setProperty('voice', voices[1].id)
            else:
                engine.setProperty('voice', voices[0].id)

            engine.say(segment.get('text', ''))

        engine.save_to_file(
            " ".join([s.get('text', '') for s in segments]),
            output_path
        )
        engine.runAndWait()

        if os.path.exists(output_path):
            return FileResponse(output_path, media_type="audio/wav", filename="podcast.wav")
        else:
            raise HTTPException(status_code=500, detail="Audio generation failed")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Podcast synthesis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Audio synthesis failed: {str(e)}")
