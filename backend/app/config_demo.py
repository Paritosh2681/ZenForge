from pydantic import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    """Application configuration - Demo Version"""

    # Application
    APP_NAME: str = "Guru-Agent (Project Cortex) - DEMO"
    VERSION: str = "0.1.0-demo"
    DEBUG: bool = True

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "data" / "uploads"

    # Local LLM Configuration (Ollama)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral:7b"

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure directories exist
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

settings = Settings()
