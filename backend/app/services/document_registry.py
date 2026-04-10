from typing import List, Dict, Any, Optional

from app.services.database import get_database


class DocumentRegistry:
    """Stores and fetches uploaded document metadata from SQLite."""

    def __init__(self):
        self.db: Any = get_database()

    async def add_document(
        self,
        document_id: str,
        filename: str,
        file_type: str,
        file_size: int,
        chunks_created: int,
        total_pages: Optional[int] = None,
    ) -> None:
        conn = await self.db.connect()
        await conn.execute(
            """
            INSERT OR REPLACE INTO documents (
                id,
                filename,
                file_type,
                file_size,
                chunks_created,
                total_pages,
                upload_date
            )
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (
                document_id,
                filename,
                file_type,
                file_size,
                chunks_created,
                total_pages,
            ),
        )
        await conn.commit()

    async def list_documents(self) -> List[Dict[str, Any]]:
        conn = await self.db.connect()
        cursor = await conn.execute(
            """
            SELECT
                id,
                filename,
                file_type,
                file_size,
                chunks_created,
                total_pages,
                upload_date
            FROM documents
            ORDER BY upload_date DESC
            """
        )

        documents: List[Dict[str, Any]] = []
        async for row in cursor:
            documents.append(
                {
                    "document_id": row[0],
                    "filename": row[1],
                    "file_type": row[2],
                    "file_size": row[3],
                    "chunks_created": row[4],
                    "total_pages": row[5],
                    "upload_date": row[6],
                }
            )

        return documents

    async def delete_document(self, document_id: str) -> bool:
        """Delete a document from the registry and return True if successful."""
        conn = await self.db.connect()
        cursor = await conn.execute(
            "DELETE FROM documents WHERE id = ?",
            (document_id,)
        )
        await conn.commit()
        
        # Return True if a row was deleted
        return cursor.rowcount > 0

    async def get_document(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get a single document by ID."""
        conn = await self.db.connect()
        cursor = await conn.execute(
            """
            SELECT
                id,
                filename,
                file_type,
                file_size,
                chunks_created,
                total_pages,
                upload_date
            FROM documents
            WHERE id = ?
            """,
            (document_id,)
        )
        
        row = await cursor.fetchone()
        if row:
            return {
                "document_id": row[0],
                "filename": row[1],
                "file_type": row[2],
                "file_size": row[3],
                "chunks_created": row[4],
                "total_pages": row[5],
                "upload_date": row[6],
            }
        return None
