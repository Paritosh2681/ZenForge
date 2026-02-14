"""
Guru-Agent Demo Backend
Simplified version for testing architecture without heavy dependencies
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import uuid
import httpx

# Simple in-memory storage for demo
documents_db = {}
conversation_history = []

# Custom CORS middleware for local development
class CustomCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response

app = FastAPI(
    title="Guru-Agent DEMO",
    version="0.1.0-demo",
    description="Demo version - Full RAG with dependencies coming soon!"
)

# Add custom CORS middleware
app.add_middleware(CustomCORSMiddleware)

# Schemas
class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    file_size: int
    chunks_created: int
    status: str
    message: str

class SourceChunk(BaseModel):
    content: str
    document_name: str
    page_number: Optional[int] = None
    similarity_score: float

class ChatRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    include_sources: bool = True
    generate_diagram: bool = True

class ChatResponse(BaseModel):
    response: str
    sources: List[SourceChunk]
    mermaid_diagram: Optional[str] = None
    conversation_id: str
    timestamp: datetime

# Routes
@app.get("/")
async def root():
    return {
        "app": "Guru-Agent DEMO",
        "version": "0.1.0-demo",
        "status": "running",
        "message": "Demo version - Install full dependencies for complete features",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    # Check if Ollama is running
    ollama_status = False
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:11434/api/tags")
            ollama_status = response.status_code == 200
    except:
        pass

    return {
        "status": "healthy",
        "app": "Guru-Agent DEMO",
        "ollama_connected": ollama_status,
        "documents_indexed": len(documents_db)
    }

@app.post("/documents/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """MOCK: Upload document (demo version)"""

    # Validate file type
    allowed_extensions = {".pdf", ".pptx", ".ppt", ".docx", ".doc", ".txt"}
    file_extension = file.filename.split(".")[-1].lower()

    if f".{file_extension}" not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Read file
    content = await file.read()
    file_size = len(content)

    # Mock processing
    doc_id = str(uuid.uuid4())
    mock_chunks = 15  # Simulate chunking

    documents_db[doc_id] = {
        "filename": file.filename,
        "size": file_size,
        "chunks": mock_chunks,
        "content_preview": f"Document: {file.filename}\n\nThis is a demo. Full document processing requires ChromaDB installation."
    }

    return DocumentUploadResponse(
        document_id=doc_id,
        filename=file.filename,
        file_size=file_size,
        chunks_created=mock_chunks,
        status="success",
        message=f"✓ DEMO: Document uploaded. {mock_chunks} chunks would be created with full setup."
    )

@app.get("/documents/count")
async def get_document_count():
    total_chunks = sum(doc["chunks"] for doc in documents_db.values())
    return {"total_chunks": total_chunks}

@app.post("/chat/query", response_model=ChatResponse)
async def chat_query(request: ChatRequest):
    """MOCK: Chat with AI (demo version - uses Ollama if available)"""

    conversation_id = request.conversation_id or str(uuid.uuid4())

   # Check if we have documents
    if not documents_db:
        return ChatResponse(
            response="👋 Welcome to Guru-Agent DEMO!\n\nPlease upload some documents first, then I can help answer questions about them.\n\n📝 This is a demo version. For full RAG capabilities with ChromaDB vector search, complete the dependency installation.",
            sources=[],
            mermaid_diagram=None,
            conversation_id=conversation_id,
            timestamp=datetime.now()
        )

    # Create mock sources
    mock_sources = [
        SourceChunk(
            content=doc["content_preview"][:200] + "...",
            document_name=doc["filename"],
            page_number=1,
            similarity_score=0.85
        )
        for doc in list(documents_db.values())[:2]
    ]

    # Try to use Ollama if available
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            payload = {
                "model": "mistral:7b",
                "prompt": f"""You are Guru-Agent, an educational AI assistant. Answer this question based on the uploaded documents:

Question: {request.query}

Context: {len(documents_db)} document(s) uploaded.

Provide a helpful, educational response. If this involves a process or workflow, include a Mermaid diagram at the end using this format:

```mermaid
flowchart TD
    A[Start] --> B[Step 1]
    B --> C[Step 2]
    C --> D[End]
```
""",
                "stream": False
            }

            response = await client.post("http://localhost:11434/api/generate", json=payload)

            if response.status_code == 200:
                result = response.json()
                ai_response = result.get("response", "")

                # Extract mermaid diagram if present
                mermaid_diagram = None
                if "```mermaid" in ai_response:
                    start = ai_response.find("```mermaid") + 10
                    end = ai_response.find("```", start)
                    if end > start:
                        mermaid_diagram = ai_response[start:end].strip()

                return ChatResponse(
                    response=ai_response,
                    sources=mock_sources,
                    mermaid_diagram=mermaid_diagram,
                    conversation_id=conversation_id,
                    timestamp=datetime.now()
                )
    except Exception as e:
        # Fallback if Ollama not available
        pass

    # Fallback response
    fallback_response = f"""📚 Based on your {len(documents_db)} uploaded document(s), here's what I can tell you about: "{request.query}"

🔍 In a full setup, I would:
1. Search through document chunks using vector similarity
2. Retrieve the most relevant passages
3. Generate a contextualized answer using the local LLM
4. Provide source citations with page numbers

**Current Status**: Demo mode - Ollama may not be running or misconfigured.

**To enable full capabilities**:
1. Ensure Ollama is running: `ollama serve`
2. Verify model is available: `ollama list` (should show mistral:7b)
3. Install remaining Python dependencies (see README)"""

    # Generate a sample diagram
    sample_diagram = None
    if request.generate_diagram and "process" in request.query.lower():
        sample_diagram = """flowchart TD
    A[Upload Documents] --> B[Process & Chunk]
    B --> C[Generate Embeddings]
    C --> D[Store in Vector DB]
    D --> E[Query Processing]
    E --> F[Retrieve Relevant Chunks]
    F --> G[Generate AI Response]"""

    return ChatResponse(
        response=fallback_response,
        sources=mock_sources,
        mermaid_diagram=sample_diagram,
        conversation_id=conversation_id,
        timestamp=datetime.now()
    )

@app.get("/chat/health")
async def chat_health():
    ollama_healthy = False
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(5.0)) as client:
            response = await client.get("http://localhost:11434/api/tags")
            ollama_healthy = response.status_code == 200
    except:
        pass

    return {
        "ollama_connected": ollama_healthy,
        "vector_db_status": "demo_mode",
        "documents_indexed": len(documents_db)
    }

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("Guru-Agent DEMO Backend Starting...")
    print("="*60)
    print(f"Backend: http://localhost:8000")
    print(f"API Docs: http://localhost:8000/docs")
    print(f"Status: Demo mode (simplified dependencies)")
    print("="*60 + "\n")

    uvicorn.run(
        "main_demo:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
