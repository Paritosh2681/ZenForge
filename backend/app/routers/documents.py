from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import uuid

from app.models.schemas import DocumentUploadResponse
from app.services.document_processor import DocumentProcessor
from app.services.rag_engine import RAGEngine
from app.config import settings

router = APIRouter(prefix="/documents", tags=["documents"])

document_processor = DocumentProcessor()
rag_engine = RAGEngine()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document (PDF, PPTX, DOCX)"""

    # Validate file type
    allowed_extensions = {".pdf", ".pptx", ".ppt", ".docx", ".doc"}
    file_extension = Path(file.filename).suffix.lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_extensions)}"
        )

    # Validate file size
    file_size = 0
    temp_file_path = None

    try:
        # Save uploaded file temporarily
        file_id = str(uuid.uuid4())
        temp_file_path = settings.UPLOAD_DIR / f"{file_id}_{file.filename}"

        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = temp_file_path.stat().st_size
        max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

        if file_size > max_size:
            temp_file_path.unlink()
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE_MB}MB"
            )

        # Process document (extract text and chunk)
        processed_data = await document_processor.process_document(
            temp_file_path,
            file.filename
        )

        # Index chunks into vector store
        chunks_indexed = await rag_engine.index_document(processed_data["chunks"])

        return DocumentUploadResponse(
            document_id=processed_data["document_id"],
            filename=file.filename,
            file_size=file_size,
            chunks_created=chunks_indexed,
            status="success",
            message=f"Document processed successfully. {chunks_indexed} chunks indexed."
        )

    except ValueError as e:
        if temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        if temp_file_path and temp_file_path.exists():
            temp_file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.get("/count")
async def get_document_count():
    """Get total number of indexed chunks"""
    count = rag_engine.vector_store.get_document_count()
    return {"total_chunks": count}
