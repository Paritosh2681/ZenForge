"""
Conversation Manager: Handles CRUD operations for conversations and messages.
"""
import uuid
import json
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.services.database import get_database
from app.models.conversation_schemas import (
    Conversation,
    ConversationDetail,
    Message,
    MessageMetadata,
    ContextSummary
)

logger = logging.getLogger(__name__)


class ConversationManager:
    """Manages conversation storage and retrieval"""

    def __init__(self):
        self.db = get_database()

    async def create_conversation(self, title: Optional[str] = None) -> Conversation:
        """Create a new conversation"""
        conversation_id = str(uuid.uuid4())
        title = title or "New Conversation"

        conn = await self.db.connect()
        await conn.execute(
            """
            INSERT INTO conversations (id, title, created_at, updated_at, message_count)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
            """,
            (conversation_id, title)
        )
        await conn.commit()

        logger.info(f"Created conversation: {conversation_id}")

        return Conversation(
            id=conversation_id,
            title=title,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            message_count=0,
            is_archived=False
        )

    async def get_conversation(self, conversation_id: str) -> Optional[ConversationDetail]:
        """Get a conversation with all its messages"""
        conn = await self.db.connect()

        # Get conversation metadata
        cursor = await conn.execute(
            """
            SELECT id, title, created_at, updated_at, message_count, is_archived
            FROM conversations
            WHERE id = ?
            """,
            (conversation_id,)
        )
        row = await cursor.fetchone()

        if not row:
            return None

        # Get all messages
        messages = await self.get_messages(conversation_id)

        # Get linked documents
        linked_docs = await self.get_linked_documents(conversation_id)

        # Get first user message as preview
        preview = None
        for msg in messages:
            if msg.role == "user":
                preview = msg.content[:100]
                break

        return ConversationDetail(
            id=row[0],
            title=row[1],
            created_at=row[2],
            updated_at=row[3],
            message_count=row[4],
            is_archived=bool(row[5]),
            preview=preview,
            messages=messages,
            linked_documents=linked_docs
        )

    async def list_conversations(
        self,
        limit: int = 100,
        offset: int = 0,
        include_archived: bool = False
    ) -> List[Conversation]:
        """List all conversations"""
        conn = await self.db.connect()

        where_clause = "" if include_archived else "WHERE is_archived = 0"

        cursor = await conn.execute(
            f"""
            SELECT id, title, created_at, updated_at, message_count, is_archived
            FROM conversations
            {where_clause}
            ORDER BY updated_at DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset)
        )

        conversations = []
        async for row in cursor:
            # Get first user message as preview
            preview_cursor = await conn.execute(
                """
                SELECT content FROM messages
                WHERE conversation_id = ? AND role = 'user'
                ORDER BY timestamp ASC
                LIMIT 1
                """,
                (row[0],)
            )
            preview_row = await preview_cursor.fetchone()
            preview = preview_row[0][:100] if preview_row else None

            conversations.append(
                Conversation(
                    id=row[0],
                    title=row[1],
                    created_at=row[2],
                    updated_at=row[3],
                    message_count=row[4],
                    is_archived=bool(row[5]),
                    preview=preview
                )
            )

        return conversations

    async def update_conversation(
        self,
        conversation_id: str,
        title: Optional[str] = None,
        is_archived: Optional[bool] = None
    ) -> bool:
        """Update conversation metadata"""
        conn = await self.db.connect()

        updates = []
        params = []

        if title is not None:
            updates.append("title = ?")
            params.append(title)

        if is_archived is not None:
            updates.append("is_archived = ?")
            params.append(int(is_archived))

        if not updates:
            return False

        updates.append("updated_at = CURRENT_TIMESTAMP")
        params.append(conversation_id)

        await conn.execute(
            f"""
            UPDATE conversations
            SET {', '.join(updates)}
            WHERE id = ?
            """,
            tuple(params)
        )
        await conn.commit()

        logger.info(f"Updated conversation: {conversation_id}")
        return True

    async def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation and all its messages"""
        conn = await self.db.connect()

        # Foreign key cascade will delete messages automatically
        cursor = await conn.execute(
            "DELETE FROM conversations WHERE id = ?",
            (conversation_id,)
        )
        await conn.commit()

        deleted = cursor.rowcount > 0
        if deleted:
            logger.info(f"Deleted conversation: {conversation_id}")

        return deleted

    async def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        token_count: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Message:
        """Add a message to a conversation"""
        message_id = str(uuid.uuid4())
        metadata_json = json.dumps(metadata) if metadata else None

        conn = await self.db.connect()

        # Insert message
        await conn.execute(
            """
            INSERT INTO messages (id, conversation_id, role, content, token_count, metadata, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """,
            (message_id, conversation_id, role, content, token_count, metadata_json)
        )

        # Update conversation message count and updated_at
        await conn.execute(
            """
            UPDATE conversations
            SET message_count = message_count + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            """,
            (conversation_id,)
        )

        await conn.commit()

        logger.debug(f"Added {role} message to conversation {conversation_id}")

        return Message(
            id=message_id,
            conversation_id=conversation_id,
            role=role,
            content=content,
            timestamp=datetime.now(),
            token_count=token_count,
            metadata=MessageMetadata(**metadata) if metadata else None
        )

    async def get_messages(
        self,
        conversation_id: str,
        limit: Optional[int] = None,
        offset: int = 0
    ) -> List[Message]:
        """Get messages for a conversation"""
        conn = await self.db.connect()

        query = """
            SELECT id, conversation_id, role, content, timestamp, token_count, metadata
            FROM messages
            WHERE conversation_id = ?
            ORDER BY timestamp ASC
        """

        if limit is not None:
            query += f" LIMIT {limit} OFFSET {offset}"

        cursor = await conn.execute(query, (conversation_id,))

        messages = []
        async for row in cursor:
            metadata_dict = json.loads(row[6]) if row[6] else None
            messages.append(
                Message(
                    id=row[0],
                    conversation_id=row[1],
                    role=row[2],
                    content=row[3],
                    timestamp=row[4],
                    token_count=row[5],
                    metadata=MessageMetadata(**metadata_dict) if metadata_dict else None
                )
            )

        return messages

    async def link_document(
        self,
        conversation_id: str,
        document_id: str
    ):
        """Link a document to a conversation"""
        conn = await self.db.connect()

        try:
            await conn.execute(
                """
                INSERT INTO conversation_documents (conversation_id, document_id)
                VALUES (?, ?)
                ON CONFLICT DO NOTHING
                """,
                (conversation_id, document_id)
            )
            await conn.commit()
        except Exception as e:
            logger.warning(f"Failed to link document: {e}")

    async def get_linked_documents(self, conversation_id: str) -> List[str]:
        """Get all documents linked to a conversation"""
        conn = await self.db.connect()

        cursor = await conn.execute(
            """
            SELECT document_id
            FROM conversation_documents
            WHERE conversation_id = ?
            ORDER BY first_referenced_at ASC
            """,
            (conversation_id,)
        )

        documents = []
        async for row in cursor:
            documents.append(row[0])

        return documents

    async def create_summary(
        self,
        conversation_id: str,
        summary_text: str,
        covers_message_range: Optional[str] = None,
        token_count: Optional[int] = None
    ) -> ContextSummary:
        """Create a context summary for a conversation"""
        summary_id = str(uuid.uuid4())

        conn = await self.db.connect()
        await conn.execute(
            """
            INSERT INTO context_summaries (
                id, conversation_id, summary_text, covers_message_range, token_count
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (summary_id, conversation_id, summary_text, covers_message_range, token_count)
        )
        await conn.commit()

        return ContextSummary(
            id=summary_id,
            conversation_id=conversation_id,
            summary_text=summary_text,
            covers_message_range=covers_message_range,
            token_count=token_count or 0,
            created_at=datetime.now()
        )

    async def get_latest_summary(self, conversation_id: str) -> Optional[ContextSummary]:
        """Get the latest summary for a conversation"""
        conn = await self.db.connect()

        cursor = await conn.execute(
            """
            SELECT id, conversation_id, summary_text, covers_message_range, token_count, created_at
            FROM context_summaries
            WHERE conversation_id = ?
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (conversation_id,)
        )

        row = await cursor.fetchone()
        if not row:
            return None

        return ContextSummary(
            id=row[0],
            conversation_id=row[1],
            summary_text=row[2],
            covers_message_range=row[3],
            token_count=row[4],
            created_at=row[5]
        )

    async def auto_generate_title(self, conversation_id: str, first_message: str, llm_client) -> str:
        """Auto-generate a conversation title from first message"""
        try:
            # Use LLM to generate a concise title
            prompt = f"""Based on this user message, generate a short conversation title (3-5 words):

"{first_message[:200]}"

Title:"""

            title = await llm_client.generate(
                prompt=prompt,
                temperature=0.3,
                max_tokens=20
            )

            title = title.strip().strip('"').strip("'")[:50]

            # Update conversation with generated title
            await self.update_conversation(conversation_id, title=title)

            return title
        except Exception as e:
            logger.warning(f"Failed to auto-generate title: {e}")
            return "New Conversation"
