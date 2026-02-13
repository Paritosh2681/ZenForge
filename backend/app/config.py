from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    """Application configuration with local-first architecture"""

    # Application
    APP_NAME: str = "Guru-Agent (Project Cortex)"
    VERSION: str = "0.1.0-phase1"
    DEBUG: bool = True

    # Paths (relative to project root)
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "data" / "uploads"
    VECTOR_DB_DIR: Path = BASE_DIR / "data" / "vectordb"
    CACHE_DIR: Path = BASE_DIR / "data" / "cache"

    # Local LLM Configuration (Ollama)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "mistral:7b"  # Default model

    # Embedding Model (Local via sentence-transformers)
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # ChromaDB
    CHROMA_COLLECTION_NAME: str = "guru_agent_knowledge"

    # Document Processing
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    MAX_UPLOAD_SIZE_MB: int = 50

    # RAG Configuration
    TOP_K_RETRIEVAL: int = 4
    SIMILARITY_THRESHOLD: float = 0.7

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Ensure directories exist
        self.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        self.VECTOR_DB_DIR.mkdir(parents=True, exist_ok=True)
        self.CACHE_DIR.mkdir(parents=True, exist_ok=True)

settings = Settings()
