import uuid
from pathlib import Path
from typing import List, Dict, Any
import PyPDF2
from pptx import Presentation
from docx import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

from app.config import settings

class DocumentProcessor:
    """Handles document upload, parsing, and chunking"""

    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    async def process_document(self, file_path: Path, filename: str) -> Dict[str, Any]:
        """Process uploaded document and return chunks with metadata"""

        file_extension = file_path.suffix.lower()
        document_id = str(uuid.uuid4())

        # Extract text based on file type
        if file_extension == ".pdf":
            text, metadata = self._extract_pdf(file_path)
        elif file_extension in [".pptx", ".ppt"]:
            text, metadata = self._extract_pptx(file_path)
        elif file_extension in [".docx", ".doc"]:
            text, metadata = self._extract_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")

        # Chunk the text
        chunks = self.text_splitter.split_text(text)

        # Prepare chunk metadata
        chunk_data = []
        for idx, chunk in enumerate(chunks):
            chunk_data.append({
                "text": chunk,
                "metadata": {
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_index": idx,
                    "total_chunks": len(chunks),
                    **metadata
                }
            })

        return {
            "document_id": document_id,
            "filename": filename,
            "chunks": chunk_data,
            "metadata": metadata
        }

    def _extract_pdf(self, file_path: Path) -> tuple[str, Dict[str, Any]]:
        """Extract text from PDF"""
        text = ""
        page_count = 0

        with open(file_path, "rb") as file:
            pdf_reader = PyPDF2.PdfReader(file)
            page_count = len(pdf_reader.pages)

            for page_num, page in enumerate(pdf_reader.pages, start=1):
                page_text = page.extract_text()
                text += f"\n--- Page {page_num} ---\n{page_text}\n"

        metadata = {
            "file_type": "pdf",
            "total_pages": page_count
        }

        return text, metadata

    def _extract_pptx(self, file_path: Path) -> tuple[str, Dict[str, Any]]:
        """Extract text from PowerPoint"""
        prs = Presentation(file_path)
        text = ""
        slide_count = len(prs.slides)

        for slide_num, slide in enumerate(prs.slides, start=1):
            slide_text = f"\n--- Slide {slide_num} ---\n"

            for shape in slide.shapes:
                if hasattr(shape, "text"):
                    slide_text += shape.text + "\n"

            text += slide_text

        metadata = {
            "file_type": "pptx",
            "total_pages": slide_count
        }

        return text, metadata

    def _extract_docx(self, file_path: Path) -> tuple[str, Dict[str, Any]]:
        """Extract text from Word document"""
        doc = Document(file_path)
        text = "\n\n".join([para.text for para in doc.paragraphs if para.text.strip()])

        metadata = {
            "file_type": "docx",
            "total_pages": None  # Word doesn't have fixed pages
        }

        return text, metadata
