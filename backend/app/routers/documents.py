from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import uuid

from app.models.schemas import (
    DocumentUploadResponse,
    DocumentListItem,
    DocumentListResponse,
)
from app.services.document_processor import DocumentProcessor
from app.services.rag_engine import RAGEngine
from app.services.document_registry import DocumentRegistry
from app.config import settings

router = APIRouter(prefix="/documents", tags=["documents"])

document_processor = DocumentProcessor()
rag_engine = RAGEngine()
document_registry = DocumentRegistry()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document (PDF, PPTX, DOCX)"""

    # Validate file type
    allowed_extensions = {".pdf", ".pptx", ".ppt", ".docx", ".doc", ".txt"}
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
            file.filename,
            document_id=file_id,
        )

        # Index chunks into vector store
        chunks_indexed = await rag_engine.index_document(processed_data["chunks"])

        # Save document metadata for listing and selection in UI
        metadata = processed_data.get("metadata", {})
        await document_registry.add_document(
            document_id=processed_data["document_id"],
            filename=file.filename,
            file_type=metadata.get("file_type", file_extension.lstrip(".")),
            file_size=file_size,
            chunks_created=chunks_indexed,
            total_pages=metadata.get("total_pages"),
        )

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


@router.get("", response_model=DocumentListResponse)
async def list_documents():
    """Get uploaded documents for document-scoped chat selection."""
    documents = await document_registry.list_documents()
    return DocumentListResponse(
        documents=[DocumentListItem(**doc) for doc in documents],
        total=len(documents),
    )

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Delete a document and its associated chunks from database and disk"""
    try:
        # First, try to get filename by checking disk files
        # Document files are named: {document_id}_{filename}
        filename_from_disk = None
        for file_path in settings.UPLOAD_DIR.glob(f"{document_id}_*"):
            if file_path.is_file():
                filename_from_disk = file_path.name.replace(f"{document_id}_", "", 1)
                break
        
        # Remove from registry (database)
        success = await document_registry.delete_document(document_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Document with ID {document_id} not found"
            )
        
        # Remove file from disk if found
        if filename_from_disk:
            file_path = settings.UPLOAD_DIR / f"{document_id}_{filename_from_disk}"
            if file_path.exists():
                try:
                    file_path.unlink()  # Delete the file
                    print(f"✓ Deleted file: {file_path.name}")
                except Exception as e:
                    print(f"Warning: Failed to delete file from disk: {e}")
                    # Don't fail the API call, the DB record is already deleted
        
        # Remove from RAG engine if it exists
        try:
            await rag_engine.remove_document(document_id)
        except Exception as e:
            # Log but don't fail if RAG removal fails
            print(f"Warning: Failed to remove document from RAG engine: {e}")
        
        file_name = filename_from_disk or "unknown"
        return {"message": f"Document '{file_name}' deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document: {str(e)}"
        )
