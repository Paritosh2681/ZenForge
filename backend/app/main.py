from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

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

# Health check endpoint (removed duplicate at line ~104)
@app.get("/api/v1/health")
def api_health_check():
    return {"status": "ok", "message": "API is running"}

# Include routers - using try/except to handle missing dependencies
try:
    from app.routers import documents, chat, multimodal, conversations, assessments, analytics
    from app.services.database import init_database
    
    app.include_router(documents.router)
    app.include_router(chat.router)
    app.include_router(multimodal.router)  # Phase 2: Multimodal features
    app.include_router(conversations.router)  # Phase 3: Conversation management
    app.include_router(assessments.router)  # Phase 4: Assessments & Quizzes
    app.include_router(analytics.router)  # Phase 4: Learning Analytics
except Exception as e:
    print(f"Warning: Could not load some routers: {e}")
    print("Running in minimal mode with health check endpoints only")

# Try to include additional optional routers
try:
    from app.routers import code_execution
    app.include_router(code_execution.router)  # Phase 3: Code Execution Sandbox
except Exception as e:
    print(f"Warning: Could not load code_execution router: {e}")

try:
    from app.routers import study_planner
    app.include_router(study_planner.router)  # Phase 5: Study Planner
except Exception as e:
    print(f"Warning: Could not load study_planner router: {e}")

try:
    from app.routers import gamification
    app.include_router(gamification.router)  # Phase 5: Gamification & Badges
except Exception as e:
    print(f"Warning: Could not load gamification router: {e}")

try:
    from app.routers import podcast
    app.include_router(podcast.router)  # Phase 4: Podcast Generation
except Exception as e:
    print(f"Warning: Could not load podcast router: {e}")

try:
    from app.routers import protege
    app.include_router(protege.router)  # Phase 4: Protege Effect
except Exception as e:
    print(f"Warning: Could not load protege router: {e}")

# Initialize database on startup if available
_init_db_available = False
try:
    from app.services.database import init_database as _init_db
    _init_db_available = True
except Exception as e:
    print(f"Warning: Database service not available: {e}")

@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup"""
    if _init_db_available:
        try:
            await _init_db()
        except Exception as e:
            print(f"Warning: Could not initialize database: {e}")

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
