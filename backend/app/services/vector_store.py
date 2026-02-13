import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer

from app.config import settings

class VectorStore:
    """ChromaDB vector store for local RAG"""

    def __init__(self):
        # Initialize ChromaDB with local persistence
        self.client = chromadb.PersistentClient(
            path=str(settings.VECTOR_DB_DIR),
            settings=ChromaSettings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )

        # Load local embedding model
        self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)

        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"description": "Guru-Agent knowledge base"}
        )

    def add_documents(self, chunks: List[Dict[str, Any]]) -> int:
        """Add document chunks to vector store"""

        texts = [chunk["text"] for chunk in chunks]
        metadatas = [chunk["metadata"] for chunk in chunks]

        # Generate embeddings locally
        embeddings = self.embedding_model.encode(texts).tolist()

        # Generate unique IDs
        ids = [
            f"{chunk['metadata']['document_id']}_chunk_{chunk['metadata']['chunk_index']}"
            for chunk in chunks
        ]

        # Add to ChromaDB
        self.collection.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )

        return len(chunks)

    def query(self, query_text: str, top_k: int = None) -> List[Dict[str, Any]]:
        """Query vector store for relevant chunks"""

        if top_k is None:
            top_k = settings.TOP_K_RETRIEVAL

        # Generate query embedding locally
        query_embedding = self.embedding_model.encode([query_text]).tolist()[0]

        # Query ChromaDB
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )

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

    def get_document_count(self) -> int:
        """Get total number of documents in vector store"""
        return self.collection.count()

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
