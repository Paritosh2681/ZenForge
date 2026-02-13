from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Document Upload & Processing
class DocumentUploadResponse(BaseModel):
    """Response after document upload"""
    document_id: str
    filename: str
    file_size: int
    chunks_created: int
    status: str
    message: str

class DocumentMetadata(BaseModel):
    """Metadata for processed documents"""
    document_id: str
    filename: str
    file_type: str
    upload_date: datetime
    total_chunks: int
    total_pages: Optional[int] = None

# Chat & RAG
class ChatRequest(BaseModel):
    """User query to the RAG system"""
    query: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None
    include_sources: bool = True
    generate_diagram: bool = True  # Auto-generate Mermaid if applicable

class SourceChunk(BaseModel):
    """Retrieved source chunk with metadata"""
    content: str
    document_name: str
    page_number: Optional[int] = None
    similarity_score: float

class ChatResponse(BaseModel):
    """AI response with sources and optional diagram"""
    response: str
    sources: List[SourceChunk]
    mermaid_diagram: Optional[str] = None  # Mermaid.js diagram code
    conversation_id: str
    timestamp: datetime

# System Health
class HealthCheck(BaseModel):
    """System health status"""
    status: str
    ollama_connected: bool
    vector_db_status: str
    documents_indexed: int
    model_loaded: Optional[str] = None
