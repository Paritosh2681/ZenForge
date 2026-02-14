from fastapi import APIRouter, HTTPException

from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag_engine import RAGEngine
from app.services.conversation_manager import ConversationManager

router = APIRouter(prefix="/chat", tags=["chat"])

rag_engine = RAGEngine()
conversation_manager = ConversationManager()


@router.post("/query", response_model=ChatResponse)
async def chat_query(request: ChatRequest):
    """Send a query to the RAG system and get AI response"""

    try:
        # Auto-create conversation if not provided (Phase 3)
        conversation_id = request.conversation_id
        if not conversation_id:
            conversation = await conversation_manager.create_conversation()
            conversation_id = conversation.id

        # Process query through RAG engine
        response = await rag_engine.query(
            user_query=request.query,
            conversation_id=conversation_id,
            include_sources=request.include_sources,
            generate_diagram=request.generate_diagram
        )

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Query processing failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Check RAG system health"""
    health = await rag_engine.health_check()
    return health
