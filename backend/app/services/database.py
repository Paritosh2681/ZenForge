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

-- Phase 4: Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    document_ids TEXT,
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard', 'mixed')),
    question_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT
);

-- Phase 4: Questions
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT CHECK(question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    difficulty TEXT,
    topic TEXT,
    options TEXT,
    correct_answer TEXT,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- Phase 4: Quiz Sessions
CREATE TABLE IF NOT EXISTS quiz_sessions (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    conversation_id TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    score INTEGER,
    max_score INTEGER,
    time_taken INTEGER,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- Phase 4: Quiz Responses
CREATE TABLE IF NOT EXISTS quiz_responses (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN,
    time_taken INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Phase 4: Topics (for knowledge tracking)
CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    document_ids TEXT,
    concept_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Phase 4: Topic Mastery
CREATE TABLE IF NOT EXISTS topic_mastery (
    id TEXT PRIMARY KEY,
    topic_id TEXT NOT NULL,
    conversation_id TEXT,
    mastery_level REAL DEFAULT 0.0,
    questions_answered INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    last_reviewed TIMESTAMP,
    next_review TIMESTAMP,
    easiness_factor REAL DEFAULT 2.5,
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_summaries_conversation ON context_summaries(conversation_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_quiz ON quiz_sessions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_session ON quiz_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_topic ON topic_mastery(topic_id);
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
