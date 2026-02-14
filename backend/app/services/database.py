"""
SQLite database initialization and connection management for conversation storage.
"""
import aiosqlite
from pathlib import Path
from typing import Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)

# Database schema
SCHEMA_SQL = """
-- Conversations (Sessions)
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    title TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT 0,
    metadata TEXT
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    token_count INTEGER,
    metadata TEXT,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Conversation-Document Links
CREATE TABLE IF NOT EXISTS conversation_documents (
    conversation_id TEXT NOT NULL,
    document_id TEXT NOT NULL,
    first_referenced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, document_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Context Summaries (for long conversations)
CREATE TABLE IF NOT EXISTS context_summaries (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    summary_text TEXT NOT NULL,
    covers_message_range TEXT,
    token_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_summaries_conversation ON context_summaries(conversation_id);
"""


class Database:
    """SQLite database manager for conversations"""

    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or settings.CONVERSATION_DB_PATH
        self._connection: Optional[aiosqlite.Connection] = None

    async def connect(self) -> aiosqlite.Connection:
        """Get or create database connection"""
        if self._connection is None:
            self._connection = await aiosqlite.connect(str(self.db_path))
            # Enable foreign keys
            await self._connection.execute("PRAGMA foreign_keys = ON")
            # Use WAL mode for better concurrency
            await self._connection.execute("PRAGMA journal_mode = WAL")
        return self._connection

    async def close(self):
        """Close database connection"""
        if self._connection:
            await self._connection.close()
            self._connection = None

    async def init_schema(self):
        """Initialize database schema"""
        db = await self.connect()

        # Check if conversations table exists
        cursor = await db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'"
        )
        exists = await cursor.fetchone()

        if not exists:
            logger.info("Creating conversation database schema...")
            await db.executescript(SCHEMA_SQL)
            await db.commit()
            logger.info("✓ Conversation database schema created successfully")
        else:
            logger.info("✓ Conversation database schema already exists")


# Global database instance
_db_instance: Optional[Database] = None


def get_database() -> Database:
    """Get global database instance"""
    global _db_instance
    if _db_instance is None:
        _db_instance = Database()
    return _db_instance


async def init_database():
    """Initialize database on application startup"""
    db = get_database()
    await db.init_schema()
    logger.info(f"Database initialized at: {db.db_path}")
