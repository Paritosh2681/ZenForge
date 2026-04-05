"""
Phase 2 API Routes - Multimodal & Multilingual Features
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, WebSocket
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import base64
import logging

logger = logging.getLogger(__name__)

# Optional heavy imports
try:
    import numpy as np
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logger.warning("OpenCV/numpy not available - attention tracking disabled")

from app.services.attention_tracker import AttentionTracker
from app.services.voice_input import VoiceInputService
from app.services.text_to_speech import TextToSpeechService

router = APIRouter(prefix="/multimodal", tags=["multimodal"])

# Initialize services (lazy loading for performance)
attention_tracker = None
voice_service = None
tts_service = None

def get_attention_tracker():
    global attention_tracker
    if attention_tracker is None:
        attention_tracker = AttentionTracker()
    return attention_tracker

def get_voice_service():
    global voice_service
    if voice_service is None:
        voice_service = VoiceInputService(model_size="base")
    return voice_service

def get_tts_service():
    global tts_service
    if tts_service is None:
        tts_service = TextToSpeechService(use_advanced=True)
    return tts_service

# Schemas
class AttentionAnalysisRequest(BaseModel):
    image_base64: str  # Base64 encoded image from webcam

class VoiceTranscriptionRequest(BaseModel):
    language: Optional[str] = None
    translate_to_english: bool = False

class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    speaker_wav_base64: Optional[str] = None  # For voice cloning

# Routes

@router.post("/analyze-attention")
async def analyze_attention(request: AttentionAnalysisRequest):
    """Analyze student attention from webcam frame"""
    try:
        # Validate request
        if not request.image_base64:
            return {
                "face_detected": False,
                "looking_at_screen": False,
                "attention_level": "low",
                "message": "No image provided"
            }

        try:
            # Quick validation - check if image base64 is valid and not empty
            image_base64 = request.image_base64.split(",")[1] if "," in request.image_base64 else request.image_base64
            
            if not image_base64 or len(image_base64) < 100:  # Minimum valid image size
                return {
                    "face_detected": False,
                    "looking_at_screen": False,
                    "attention_level": "low",
                    "blink_rate": 0,
                    "is_fatigued": False,
                    "message": "Invalid image - too small"
                }

            if not CV2_AVAILABLE:
                logger.warning("CV2 not available - returning safe response")
                # Can't analyze without CV2
                return {
                    "face_detected": False,
                    "looking_at_screen": False,
                    "attention_level": "low",
                    "blink_rate": 0,
                    "is_fatigued": False,
                    "message": "OpenCV not available"
                }

            # Try to decode and analyze the frame
            image_data = base64.b64decode(image_base64)
            nparr = np.frombuffer(image_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is None or frame.size == 0:
                logger.warning("Failed to decode frame from base64")
                return {
                    "face_detected": False,
                    "looking_at_screen": False,
                    "attention_level": "low",
                    "blink_rate": 0,
                    "is_fatigued": False,
                    "message": "Invalid image format"
                }

            # Analyze frame with attention tracker
            tracker = get_attention_tracker()
            if tracker is None:
                logger.warning("AttentionTracker not available")
                # Return safe fallback response
                return {
                    "face_detected": False,
                    "looking_at_screen": False,
                    "attention_level": "low",
                    "blink_rate": 0,
                    "is_fatigued": False,
                    "message": "Tracker unavailable"
                }

            # analyze_frame handles both MediaPipe and fallback detection
            metrics = tracker.analyze_frame(frame)

            if metrics is None:
                # No face, return accurately
                return {
                    "face_detected": False,
                    "looking_at_screen": False,
                    "attention_level": "low",
                    "blink_rate": 0,
                    "is_fatigued": False,
                    "message": "No face detected"
                }

            # Check if intervention needed
            intervention = tracker.get_intervention_recommendation(metrics)

            response = {
                **metrics,
                "intervention_needed": intervention is not None,
                "intervention_type": intervention
            }

            # Add intervention messages
            if intervention:
                messages = {
                    "fatigue_detected": "You seem tired. Consider taking a short break!",
                    "attention_drift": "Let's refocus! The content is getting interesting.",
                    "low_engagement": "How about we try a different approach to this topic?"
                }
                response["intervention_message"] = messages.get(intervention, "")

            logger.info(f"Attention analysis success: face_detected={metrics.get('face_detected')}, attention_level={metrics.get('attention_level')}")
            return response

        except Exception as inner_error:
            logger.error(f"Error in frame analysis: {str(inner_error)}", exc_info=True)
            # Return safe fallback response instead of erroring
            return {
                "face_detected": False,
                "looking_at_screen": False,
                "attention_level": "low",
                "blink_rate": 0,
                "is_fatigued": False,
                "error": str(inner_error)
            }

    except Exception as e:
        logger.error(f"Attention analysis endpoint error: {str(e)}", exc_info=True)
        # Return error response instead of 500
        return {
            "face_detected": False,
            "looking_at_screen": False,
            "attention_level": "low",
            "blink_rate": 0,
            "is_fatigued": False,
            "error": str(e)
        }

@router.post("/transcribe-voice")
async def transcribe_voice(
    audio: UploadFile = File(...),
    language: Optional[str] = None,
    translate: bool = False
):
    """Transcribe voice input to text (multilingual)"""
    try:
        service = get_voice_service()

        # Read audio file
        audio_data = await audio.read()

        # Transcribe
        if translate:
            result = service.translate_to_english(audio_data)
        else:
            result = service.transcribe_audio(audio_data, language=language)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice transcription failed: {str(e)}")

@router.post("/synthesize-speech")
async def synthesize_speech(request: TTSRequest):
    """Convert text to speech (multilingual)"""
    try:
        service = get_tts_service()

        # Synthesize
        result = service.synthesize_multilingual(
            text=request.text,
            target_language=request.language
        )

        if not result.get("success"):
            raise HTTPException(status_code=500, detail=result.get("error", "TTS failed"))

        # Return audio file
        return FileResponse(
            result["audio_path"],
            media_type="audio/wav",
            filename="response.wav",
            background=None  # Don't delete file immediately
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")

@router.get("/supported-languages")
async def get_supported_languages():
    """Get list of supported languages for voice/TTS"""
    try:
        voice_service = get_voice_service()
        tts_service = get_tts_service()

        return {
            "voice_input": {
                "languages": voice_service.supported_languages,
                "auto_detect": True
            },
            "text_to_speech": {
                "languages": tts_service.get_supported_languages()
            }
        }

    except Exception as e:
        return {
            "voice_input": {"languages": ["en", "hi"], "auto_detect": True},
            "text_to_speech": {"languages": {"en": "English"}}
        }

@router.websocket("/attention-stream")
async def attention_stream(websocket: WebSocket):
    """WebSocket for real-time attention monitoring"""
    await websocket.accept()
    tracker = get_attention_tracker()

    try:
        while True:
            # Receive frame from client
            data = await websocket.receive_json()

            if "reset" in data and data["reset"]:
                tracker.reset()
                await websocket.send_json({"message": "Tracker reset"})
                continue

            if "image" not in data:
                continue

            # Decode and analyze
            image_data = base64.b64decode(data["image"].split(",")[1] if "," in data["image"] else data["image"])
            nparr = np.frombuffer(image_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            metrics = tracker.analyze_frame(frame)

            if metrics:
                intervention = tracker.get_intervention_recommendation(metrics)
                metrics["intervention_needed"] = intervention is not None
                metrics["intervention_type"] = intervention

                await websocket.send_json(metrics)
            else:
                await websocket.send_json({"face_detected": False})

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

@router.post("/reset-attention-tracker")
async def reset_attention_tracker():
    """Reset attention tracking state"""
    try:
        tracker = get_attention_tracker()
        tracker.reset()
        return {"message": "Attention tracker reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
