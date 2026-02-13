"""
Text-to-Speech Service - Multilingual Audio Output
Uses Coqui TTS for local multilingual synthesis
"""

from TTS.api import TTS
import pyttsx3
from typing import Optional, Dict
from pathlib import Path
import tempfile

class TextToSpeechService:
    """Local text-to-speech with multilingual support"""

    def __init__(self, use_advanced: bool = True):
        """
        Initialize TTS service

        Args:
            use_advanced: Use Coqui TTS (better quality) vs pyttsx3 (lightweight)
        """
        self.use_advanced = use_advanced

        if use_advanced:
            try:
                # Initialize Coqui TTS (supports multiple languages)
                print("Loading Coqui TTS model...")
                self.tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")
                print("Coqui TTS loaded successfully")
                self.fallback = None
            except Exception as e:
                print(f"Coqui TTS failed to load: {e}. Using pyttsx3 fallback.")
                self.use_advanced = False
                self._init_fallback()
        else:
            self._init_fallback()

        # Supported languages for advanced TTS
        self.supported_languages = {
            "en": "English",
            "hi": "Hindi",
            "es": "Spanish",
            "fr": "French",
            "de": "German",
            "it": "Italian",
            "pt": "Portuguese",
            "pl": "Polish",
            "tr": "Turkish",
            "ru": "Russian",
            "nl": "Dutch",
            "cs": "Czech",
            "ar": "Arabic",
            "zh-cn": "Chinese",
            "ja": "Japanese",
            "ko": "Korean"
        }

    def _init_fallback(self):
        """Initialize lightweight pyttsx3 engine"""
        self.fallback = pyttsx3.init()
        # Configure voice properties
        self.fallback.setProperty('rate', 150)  # Speech rate
        self.fallback.setProperty('volume', 0.9)  # Volume (0-1)

    def synthesize(
        self,
        text: str,
        language: str = "en",
        output_path: Optional[str] = None,
        speaker_wav: Optional[str] = None
    ) -> Dict:
        """
        Convert text to speech

        Args:
            text: Text to synthesize
            language: Language code
            output_path: Path to save audio file (optional)
            speaker_wav: Reference audio for voice cloning (advanced only)

        Returns:
            Dict with audio file path and metadata
        """

        if not output_path:
            # Create temp file
            temp_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            output_path = temp_file.name
            temp_file.close()

        try:
            if self.use_advanced:
                # Use Coqui TTS
                self.tts.tts_to_file(
                    text=text,
                    file_path=output_path,
                    language=language,
                    speaker_wav=speaker_wav if speaker_wav else None
                )

                return {
                    "success": True,
                    "audio_path": output_path,
                    "text": text,
                    "language": language,
                    "language_name": self.supported_languages.get(language, language),
                    "engine": "coqui_tts",
                    "voice_cloned": speaker_wav is not None
                }

            else:
                # Use pyttsx3 fallback
                self.fallback.save_to_file(text, output_path)
                self.fallback.runAndWait()

                return {
                    "success": True,
                    "audio_path": output_path,
                    "text": text,
                    "language": language,
                    "language_name": "English (fallback)",
                    "engine": "pyttsx3",
                    "note": "Using lightweight TTS. Install Coqui for better quality."
                }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "text": text,
                "language": language
            }

    def synthesize_multilingual(
        self,
        text: str,
        target_language: str = "en",
        output_path: Optional[str] = None
    ) -> Dict:
        """
        Synthesize speech in target language

        Args:
            text: Text to speak (can be in English)
            target_language: Language to synthesize in
            output_path: Output file path

        Returns:
            Dict with audio file and metadata
        """
        # For regional language support
        if target_language in self.supported_languages:
            return self.synthesize(
                text=text,
                language=target_language,
                output_path=output_path
            )
        else:
            # Fallback to English
            return self.synthesize(
                text=text,
                language="en",
                output_path=output_path
            )

    def get_supported_languages(self) -> Dict[str, str]:
        """Get list of supported languages"""
        return self.supported_languages

    def cleanup(self, audio_path: str):
        """Delete temporary audio file"""
        try:
            Path(audio_path).unlink(missing_ok=True)
        except:
            pass
