"""
Voice Input Service - Multilingual Speech Recognition
Uses OpenAI Whisper for local speech-to-text
"""

import whisper
import numpy as np
import soundfile as sf
from typing import Dict, Optional
from pathlib import Path
import tempfile

class VoiceInputService:
    """Local speech-to-text using Whisper"""

    def __init__(self, model_size: str = "base"):
        """
        Initialize Whisper model

        Args:
            model_size: tiny, base, small, medium, large
                       - tiny: fastest, least accurate (~75MB)
                       - base: good balance (~150MB)
                       - small: better accuracy (~500MB)
                       - medium/large: best quality (1-3GB)
        """
        print(f"Loading Whisper model: {model_size}...")
        self.model = whisper.load_model(model_size)
        self.supported_languages = [
            "en",  # English
            "hi",  # Hindi
            "bn",  # Bengali
            "te",  # Telugu
            "mr",  # Marathi
            "ta",  # Tamil
            "ur",  # Urdu
            "gu",  # Gujarati
            "kn",  # Kannada
            "or",  # Oriya
            "ml",  # Malayalam
            "pa",  # Punjabi
        ]
        print(f"Whisper model loaded. Supports {len(self.supported_languages)} Indian languages.")

    def transcribe_audio(
        self,
        audio_data: bytes,
        language: Optional[str] = None,
        task: str = "transcribe"
    ) -> Dict:
        """
        Transcribe audio to text

        Args:
            audio_data: Audio bytes (WAV format)
            language: Language code (None for auto-detect)
            task: 'transcribe' or 'translate' (to English)

        Returns:
            Dict with transcription and metadata
        """
        # Save audio to temp file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
            temp_audio.write(audio_data)
            temp_path = temp_audio.name

        try:
            # Transcribe with Whisper
            options = {"task": task}
            if language:
                options["language"] = language

            result = self.model.transcribe(
                temp_path,
                **options,
                fp16=False  # Disable for CPU compatibility
            )

            # Extract information
            detected_language = result.get("language", "unknown")
            confidence = result.get("segments", [{}])[0].get("avg_logprob", 0) if result.get("segments") else 0

            return {
                "text": result["text"].strip(),
                "language": detected_language,
                "language_name": self._get_language_name(detected_language),
                "confidence": round(abs(confidence), 2),  # Convert log prob to confidence
                "task": task,
                "segments": [
                    {
                        "start": seg["start"],
                        "end": seg["end"],
                        "text": seg["text"].strip()
                    }
                    for seg in result.get("segments", [])
                ]
            }

        except Exception as e:
            return {
                "error": str(e),
                "text": "",
                "language": "unknown"
            }

        finally:
            # Cleanup temp file
            Path(temp_path).unlink(missing_ok=True)

    def transcribe_file(self, file_path: str, language: Optional[str] = None) -> Dict:
        """Transcribe audio file"""
        with open(file_path, "rb") as f:
            audio_data = f.read()

        return self.transcribe_audio(audio_data, language=language)

    def translate_to_english(self, audio_data: bytes) -> Dict:
        """Transcribe and translate to English"""
        return self.transcribe_audio(audio_data, task="translate")

    def _get_language_name(self, code: str) -> str:
        """Get full language name from code"""
        language_names = {
            "en": "English",
            "hi": "Hindi",
            "bn": "Bengali",
            "te": "Telugu",
            "mr": "Marathi",
            "ta": "Tamil",
            "ur": "Urdu",
            "gu": "Gujarati",
            "kn": "Kannada",
            "or": "Oriya",
            "ml": "Malayalam",
            "pa": "Punjabi",
        }
        return language_names.get(code, code)

    def is_indian_language(self, language_code: str) -> bool:
        """Check if detected language is Indian"""
        return language_code in self.supported_languages
