"""
Pydantic models for conversation-related API schemas.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime


class MessageMetadata(BaseModel):
    """Metadata for a message (sources, diagrams, etc.)"""
    sources: Optional[List[Dict[str, Any]]] = None
    mermaid_diagram: Optional[str] = None
    token_count: Optional[int] = None
    query_rewritten: Optional[bool] = False


class Message(BaseModel):
    """A single message in a conversation"""
    id: str
    conversation_id: str
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime
    token_count: Optional[int] = None
    metadata: Optional[MessageMetadata] = None


class ConversationBase(BaseModel):
    """Base conversation model"""
    title: Optional[str] = "New Conversation"


class ConversationCreate(ConversationBase):
    """Request to create a new conversation"""
    pass


class ConversationUpdate(BaseModel):
    """Request to update a conversation"""
    title: Optional[str] = None
    is_archived: Optional[bool] = None


class Conversation(ConversationBase):
    """Conversation summary for list views"""
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int
    is_archived: bool = False
    preview: Optional[str] = None  # First user message

    class Config:
        from_attributes = True


class ConversationDetail(Conversation):
    """Full conversation with messages"""
    messages: List[Message] = []
    linked_documents: List[str] = []

    class Config:
        from_attributes = True


class ConversationList(BaseModel):
    """List of conversations"""
    conversations: List[Conversation]
    total: int


class ContextInfo(BaseModel):
    """Information about the current context window"""
    total_tokens: int
    max_tokens: int
    messages_in_window: int
    has_summary: bool = False
    truncated: bool = False
    query_rewritten: bool = False


class ContextSummary(BaseModel):
    """A summary of conversation context"""
    id: str
    conversation_id: str
    summary_text: str
    covers_message_range: Optional[str] = None
    token_count: int
    created_at: datetime


class AddMessageRequest(BaseModel):
    """Request to add a message to a conversation"""
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(..., min_length=1)
    metadata: Optional[Dict[str, Any]] = None
