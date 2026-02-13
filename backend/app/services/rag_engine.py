from typing import Dict, Any, List
from datetime import datetime
import uuid

from app.services.vector_store import VectorStore
from app.services.llm_client import OllamaClient
from app.models.schemas import ChatResponse, SourceChunk

class RAGEngine:
    """Orchestrates Retrieval-Augmented Generation pipeline"""

    def __init__(self):
        self.vector_store = VectorStore()
        self.llm_client = OllamaClient()

    async def query(
        self,
        user_query: str,
        conversation_id: str = None,
        include_sources: bool = True,
        generate_diagram: bool = True
    ) -> ChatResponse:
        """Process user query through RAG pipeline"""

        # Generate conversation ID if not provided
        if not conversation_id:
            conversation_id = str(uuid.uuid4())

        # Step 1: Retrieve relevant chunks from vector store
        retrieved_chunks = self.vector_store.query(user_query)

        if not retrieved_chunks:
            # No relevant context found
            return ChatResponse(
                response="I don't have enough information in my knowledge base to answer that question. Please upload relevant study materials first.",
                sources=[],
                mermaid_diagram=None,
                conversation_id=conversation_id,
                timestamp=datetime.now()
            )

        # Step 2: Extract context for LLM
        context_texts = [chunk["content"] for chunk in retrieved_chunks]

        # Step 3: Generate response using LLM with context
        generation_result = await self.llm_client.generate_with_context(
            query=user_query,
            context_chunks=context_texts,
            generate_diagram=generate_diagram
        )

        # Step 4: Format sources
        sources = []
        if include_sources:
            for chunk in retrieved_chunks:
                sources.append(SourceChunk(
                    content=chunk["content"][:200] + "...",  # Truncate for UI
                    document_name=chunk["metadata"].get("filename", "Unknown"),
                    page_number=chunk["metadata"].get("page_number"),
                    similarity_score=round(chunk["similarity_score"], 3)
                ))

        # Step 5: Build response
        return ChatResponse(
            response=generation_result["response"],
            sources=sources,
            mermaid_diagram=generation_result.get("mermaid_diagram"),
            conversation_id=conversation_id,
            timestamp=datetime.now()
        )

    async def index_document(self, chunks: List[Dict[str, Any]]) -> int:
        """Index document chunks into vector store"""
        return self.vector_store.add_documents(chunks)

    async def health_check(self) -> Dict[str, Any]:
        """Check health of RAG components"""
        ollama_healthy = await self.llm_client.check_health()

        return {
            "ollama_connected": ollama_healthy,
            "vector_db_status": "operational",
            "documents_indexed": self.vector_store.get_document_count()
        }
