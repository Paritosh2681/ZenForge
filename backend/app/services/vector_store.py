import logging
from typing import List, Dict, Any, Optional
import re

from app.config import settings

logger = logging.getLogger(__name__)

# Lazy imports for heavy dependencies
try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings
    from sentence_transformers import SentenceTransformer
    VECTOR_STORE_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Vector store dependencies not available: {e}")
    VECTOR_STORE_AVAILABLE = False

class VectorStore:
    """ChromaDB vector store for local RAG"""

    def __init__(self):
        if not VECTOR_STORE_AVAILABLE:
            logger.warning("VectorStore initialized without chromadb/sentence-transformers - RAG features disabled")
            self.client = None
            self.embedding_model = None
            self.collection = None
            return

        # Initialize ChromaDB with local persistence
        self.client = chromadb.PersistentClient(
            path=str(settings.VECTOR_DB_DIR),
            settings=ChromaSettings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )

        # Load local embedding model (offline-first).
        self.embedding_model = None
        try:
            # First try local-only mode
            self.embedding_model = SentenceTransformer(
                settings.EMBEDDING_MODEL,
                local_files_only=True,
                cache_folder=str(settings.CACHE_DIR / "sentence_transformers"),
            )
            logger.info(f"✅ Loaded cached embedding model: {settings.EMBEDDING_MODEL}")
        except Exception as cache_err:
            logger.warning(f"Cached model not found: {cache_err}")
            
            if not settings.LOCAL_MODEL_ONLY:
                try:
                    # Try downloading model if not in strict offline mode
                    logger.info(f"⬇️ Downloading embedding model: {settings.EMBEDDING_MODEL}")
                    self.embedding_model = SentenceTransformer(
                        settings.EMBEDDING_MODEL,
                        local_files_only=False,
                        cache_folder=str(settings.CACHE_DIR / "sentence_transformers"),
                    )
                    logger.info(f"✅ Downloaded and cached embedding model: {settings.EMBEDDING_MODEL}")
                except Exception as download_err:
                    logger.error(f"Failed to download embedding model: {download_err}")
                    logger.warning("Embedding model unavailable, using keyword fallback retrieval")
            else:
                logger.warning("LOCAL_MODEL_ONLY=True, embedding model unavailable, using keyword fallback retrieval")

        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"description": "Guru-Agent knowledge base"}
        )

    def add_documents(self, chunks: List[Dict[str, Any]]) -> int:
        """Add document chunks to vector store"""
        if not self.collection:
            raise RuntimeError("VectorStore not available - install chromadb and sentence-transformers")

        texts = [chunk["text"] for chunk in chunks]
        metadatas = [self._sanitize_metadata(chunk["metadata"]) for chunk in chunks]

        # Generate unique IDs
        ids = [
            f"{chunk['metadata']['document_id']}_chunk_{chunk['metadata']['chunk_index']}"
            for chunk in chunks
        ]

        if not self.embedding_model:
            # Try to initialize the model again (in case it failed during startup)
            try:
                logger.info("Attempting to initialize embedding model for document processing...")
                self.embedding_model = SentenceTransformer(
                    settings.EMBEDDING_MODEL,
                    local_files_only=False,  # Allow download for document processing
                    cache_folder=str(settings.CACHE_DIR / "sentence_transformers"),
                )
                logger.info("✅ Embedding model initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize embedding model: {e}")
                logger.info("📝 Storing documents without embeddings (keyword search will be used)")
                
                # Store documents without embeddings for keyword-based retrieval
                self.collection.add(
                    documents=texts,
                    metadatas=metadatas,
                    ids=ids
                )
                
                return len(chunks)

        # Generate embeddings locally (only if model is available)
        embeddings = self.embedding_model.encode(texts).tolist()

        # Add to ChromaDB with embeddings
        self.collection.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )

        return len(chunks)

    def _sanitize_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Keep only Chroma-compatible metadata values and drop nulls."""
        safe_metadata: Dict[str, Any] = {}
        for key, value in metadata.items():
            if value is None:
                continue
            if isinstance(value, (str, int, float, bool)):
                safe_metadata[key] = value
        return safe_metadata

    def query(
        self,
        query_text: str,
        top_k: int = None,
        document_ids: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """Query vector store for relevant chunks"""
        if not self.collection:
            return []

        if top_k is None:
            top_k = settings.TOP_K_RETRIEVAL

        if not self.embedding_model:
            return self._keyword_query(query_text=query_text, top_k=top_k, document_ids=document_ids)

        # Generate query embedding locally
        query_embedding = self.embedding_model.encode([query_text]).tolist()[0]

        # Query ChromaDB, optionally constrained to selected documents.
        query_kwargs: Dict[str, Any] = {
            "query_embeddings": [query_embedding],
            "n_results": top_k,
            "include": ["documents", "metadatas", "distances"],
        }

        if document_ids:
            if len(document_ids) == 1:
                query_kwargs["where"] = {"document_id": document_ids[0]}
            else:
                query_kwargs["where"] = {"document_id": {"$in": document_ids}}

        results = self.collection.query(**query_kwargs)

        # Format results
        retrieved_chunks = []
        if results["documents"] and results["documents"][0]:
            for idx, doc in enumerate(results["documents"][0]):
                # Convert distance to similarity score (ChromaDB uses L2 distance)
                distance = results["distances"][0][idx]
                similarity_score = 1 / (1 + distance)  # Simple conversion

                if similarity_score >= settings.SIMILARITY_THRESHOLD:
                    retrieved_chunks.append({
                        "content": doc,
                        "metadata": results["metadatas"][0][idx],
                        "similarity_score": similarity_score
                    })

        return retrieved_chunks

    def _keyword_query(
        self,
        query_text: str,
        top_k: int,
        document_ids: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """Fallback retrieval when embedding model is unavailable."""
        chunks = self.get_chunks(document_ids=document_ids, limit=max(100, top_k * 20))
        if not chunks:
            return []

        query_tokens = {
            token.lower()
            for token in re.findall(r"[A-Za-z][A-Za-z0-9_-]{2,}", query_text)
        }

        if not query_tokens:
            return []

        ranked = []
        for chunk in chunks:
            content = (chunk.get("content") or "").lower()
            if not content:
                continue

            hits = sum(1 for token in query_tokens if token in content)
            if hits <= 0:
                continue

            similarity_score = min(0.99, hits / max(1, len(query_tokens)))
            ranked.append({
                "content": chunk.get("content", ""),
                "metadata": chunk.get("metadata", {}),
                "similarity_score": similarity_score,
            })

        ranked.sort(key=lambda item: item["similarity_score"], reverse=True)
        return ranked[:top_k]

    def get_chunks(
        self,
        document_ids: Optional[List[str]] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Fetch raw chunks directly from collection, optionally filtered by document IDs."""
        if not self.collection:
            return []

        get_kwargs: Dict[str, Any] = {
            "limit": limit,
            "include": ["documents", "metadatas"],
        }

        if document_ids:
            if len(document_ids) == 1:
                get_kwargs["where"] = {"document_id": document_ids[0]}
            else:
                get_kwargs["where"] = {"document_id": {"$in": document_ids}}

        results = self.collection.get(**get_kwargs)

        documents = results.get("documents") or []
        metadatas = results.get("metadatas") or []

        chunks: List[Dict[str, Any]] = []
        for idx, doc in enumerate(documents):
            metadata = metadatas[idx] if idx < len(metadatas) and metadatas[idx] else {}
            chunks.append({
                "content": doc,
                "metadata": metadata,
                "document_name": metadata.get("filename", "Unknown"),
            })

        return chunks

    def get_document_count(self) -> int:
        """Get total number of documents in vector store"""
        if not self.collection:
            return 0
        return self.collection.count()

    async def remove_document(self, document_id: str) -> bool:
        """Remove all chunks for a document from the vector store."""
        try:
            self.delete_document(document_id)
            return True
        except Exception as e:
            logger.error(f"Failed to remove document {document_id}: {e}")
            return False

    def delete_document(self, document_id: str):
        """Delete all chunks of a specific document"""
        # Query for all chunks with this document_id
        results = self.collection.get(
            where={"document_id": document_id}
        )

        if results["ids"]:
            self.collection.delete(ids=results["ids"])

    def reset(self):
        """Clear all data (use with caution)"""
        self.client.delete_collection(settings.CHROMA_COLLECTION_NAME)
        self.collection = self.client.create_collection(
            name=settings.CHROMA_COLLECTION_NAME
        )
