from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import documents, chat, multimodal, conversations, assessments, analytics, code_execution, study_planner, gamification, podcast, protege
from app.services.database import init_database

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Local-first AI Learning Companion with RAG + Multimodal Features"
)

# CORS Configuration (allow frontend to communicate)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(multimodal.router)  # Phase 2: Multimodal features
app.include_router(conversations.router)  # Phase 3: Conversation management
app.include_router(assessments.router)  # Phase 4: Assessments & Quizzes
app.include_router(analytics.router)  # Phase 4: Learning Analytics
app.include_router(code_execution.router)  # Phase 3: Code Execution Sandbox
app.include_router(study_planner.router)  # Phase 5: Study Planner
app.include_router(gamification.router)  # Phase 5: Gamification & Badges
app.include_router(podcast.router)  # Phase 4: Podcast Generation
app.include_router(protege.router)  # Phase 4: Protege Effect

@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup"""
    await init_database()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    """System health check"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
