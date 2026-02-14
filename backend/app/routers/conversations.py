"""
Conversations API Router: Manages conversation sessions and history.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging

from app.models.conversation_schemas import (
    Conversation,
    ConversationCreate,
    ConversationUpdate,
    ConversationDetail,
    ConversationList,
    ContextInfo,
    AddMessageRequest
)
from app.services.conversation_manager import ConversationManager
from app.services.context_window_manager import ContextWindowManager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/conversations", tags=["conversations"])

# Initialize services
conversation_manager = ConversationManager()
context_manager = ContextWindowManager()


@router.get("", response_model=ConversationList)
async def list_conversations(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    include_archived: bool = Query(False)
):
    """
    List all conversation sessions.

    Returns conversations sorted by most recently updated.
    """
    try:
        conversations = await conversation_manager.list_conversations(
            limit=limit,
            offset=offset,
            include_archived=include_archived
        )

        return ConversationList(
            conversations=conversations,
            total=len(conversations)
        )

    except Exception as e:
        logger.error(f"Failed to list conversations: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve conversations: {str(e)}"
        )


@router.post("", response_model=Conversation)
async def create_conversation(request: ConversationCreate):
    """
    Create a new conversation session.

    Title can be auto-generated from first message if not provided.
    """
    try:
        conversation = await conversation_manager.create_conversation(
            title=request.title
        )

        logger.info(f"Created conversation: {conversation.id}")
        return conversation

    except Exception as e:
        logger.error(f"Failed to create conversation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create conversation: {str(e)}"
        )


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(conversation_id: str):
    """
    Get a conversation with all its messages.

    Returns full conversation history and linked documents.
    """
    try:
        conversation = await conversation_manager.get_conversation(conversation_id)

        if not conversation:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found"
            )

        return conversation

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get conversation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve conversation: {str(e)}"
        )


@router.patch("/{conversation_id}", response_model=dict)
async def update_conversation(
    conversation_id: str,
    request: ConversationUpdate
):
    """
    Update conversation metadata (title, archive status).
    """
    try:
        # Check if conversation exists
        conversation = await conversation_manager.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found"
            )

        # Update conversation
        success = await conversation_manager.update_conversation(
            conversation_id=conversation_id,
            title=request.title,
            is_archived=request.is_archived
        )

        if not success:
            raise HTTPException(
                status_code=400,
                detail="No updates provided"
            )

        return {
            "conversation_id": conversation_id,
            "status": "updated"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update conversation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update conversation: {str(e)}"
        )


@router.delete("/{conversation_id}", response_model=dict)
async def delete_conversation(conversation_id: str):
    """
    Delete a conversation and all its messages.

    This action cannot be undone.
    """
    try:
        success = await conversation_manager.delete_conversation(conversation_id)

        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found"
            )

        return {
            "conversation_id": conversation_id,
            "status": "deleted"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete conversation: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete conversation: {str(e)}"
        )


@router.get("/{conversation_id}/context", response_model=ContextInfo)
async def get_context_info(conversation_id: str):
    """
    Get current context window information for a conversation.

    Shows token usage, messages in window, and truncation status.
    """
    try:
        # Get conversation messages
        conversation = await conversation_manager.get_conversation(conversation_id)

        if not conversation:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found"
            )

        # Get token stats (no RAG chunks for stats only)
        stats = context_manager.get_token_stats(
            conversation_history=conversation.messages,
            rag_chunks=[]
        )

        # Check if summarization is needed
        should_summarize = context_manager.should_summarize(conversation.message_count)

        # Check if there's an existing summary
        summary = await conversation_manager.get_latest_summary(conversation_id)

        return ContextInfo(
            total_tokens=stats['total_tokens'],
            max_tokens=stats['max_tokens'],
            messages_in_window=stats['messages_in_window'],
            has_summary=summary is not None,
            truncated=stats['truncated']
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get context info: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve context information: {str(e)}"
        )


@router.post("/{conversation_id}/messages", response_model=dict)
async def add_message(conversation_id: str, request: AddMessageRequest):
    """
    Add a message to a conversation.

    Typically used for testing or manual message injection.
    Normal chat flow uses /chat/query endpoint.
    """
    try:
        # Verify conversation exists
        conversation = await conversation_manager.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found"
            )

        # Add message
        message = await conversation_manager.add_message(
            conversation_id=conversation_id,
            role=request.role,
            content=request.content,
            metadata=request.metadata
        )

        return {
            "message_id": message.id,
            "conversation_id": conversation_id,
            "status": "added"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add message: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add message: {str(e)}"
        )
