from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Simple FastAPI app for testing
app = FastAPI(
    title="GuruCortex API",
    version="1.0.0",
    description="AI Learning Companion API"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "GuruCortex API is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "GuruCortex Backend"}

@app.get("/chat/health")
async def chat_health():
    return {"status": "healthy", "service": "Chat Service"}

@app.get("/api/dashboard")
async def dashboard():
    return {
        "message": "Welcome to GuruCortex AI Learning Companion",
        "features": [
            "AI Chat with RAG",
            "Adaptive Quiz System",
            "Code Execution Sandbox",
            "Podcast Generation",
            "Protégé Teaching System",
            "Study Planner",
            "Achievement Badges"
        ],
        "status": "Backend Connected Successfully!"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)