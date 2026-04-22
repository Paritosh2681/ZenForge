# ZenForge - Quick Start Guide

## System is Building...

Docker is currently installing all dependencies automatically. This takes 10-15 minutes the first time.

## What's Being Built

### Backend Container
- Python 3.11 environment
- FastAPI web framework
- ChromaDB vector database
- Sentence Transformers for embeddings
- PyTorch (915 MB)
- CUDA libraries for GPU acceleration (~2.5 GB)
- Phase 4: Quiz & Analytics services

### Frontend Container
- Node.js 18 environment
- Next.js 14 framework
- React 18
- Tailwind CSS
- Phase 4: Quiz UI components

## Once Ready

### Access URLs
- **Frontend Application:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Ollama (LLM):** http://localhost:11434

### Features Available

#### Phase 1: RAG Foundation
- Upload PDFs, DOCX, PPTX
- Automatic text extraction & chunking
- Vector embeddings with ChromaDB
- Semantic search
- Context-aware chat with Mistral-7B

#### Phase 2: Multimodal
- Image upload & analysis
- Audio transcription
- Multi-language support
- Vision-language understanding

#### Phase 3: Conversations
- Persistent conversation history
- Context window management
- Query rewriting for better results
- Conversation search & filtering

#### Phase 4: Quiz & Assessment ⭐ NEW
**Backend:**
- LLM-powered quiz generation (MCQ, T/F, Short Answer)
- Automatic topic extraction from documents
- SuperMemo SM-2 spaced repetition algorithm
- Mastery tracking (Novice → Advanced)
- Learning analytics & insights
- Personalized study recommendations

**Frontend:**
- Quiz generation interface
- Interactive quiz taking with progress tracking
- Detailed results with explanations
- Learning dashboard with 4 stat cards
- Topic mastery visualization
- Performance history

## Useful Commands

### Check Status
```bash
docker ps                        # Running containers
docker-compose logs backend      # Backend logs
docker-compose logs frontend     # Frontend logs
docker-compose logs -f           # Follow all logs
```

### Control Services
```bash
docker-compose up -d             # Start services
docker-compose down              # Stop services
docker-compose restart backend   # Restart backend
docker-compose restart frontend  # Restart frontend
```

### Troubleshooting
```bash
# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# View detailed logs
docker-compose logs --tail=100 backend

# Access container shell
docker exec -it guru-agent-backend bash
```

## First Time Usage

1. **Upload a Document**
   - Click "Upload" in the sidebar
   - Select a PDF/DOCX file
   - Wait for processing (automatic)

2. **Chat with Your Documents**
   - Type questions in the chat interface
   - System retrieves relevant context
   - LLM generates answers from your docs

3. **Generate a Quiz** ⭐
   - Go to "Assessment" tab
   - Click "Generate Quiz"
   - Select difficulty & question count
   - Quiz is created from your uploaded documents!

4. **Take the Quiz**
   - Questions appear one at a time
   - Progress bar shows completion
   - Timer tracks question time
   - Submit to get instant results

5. **View Analytics**
   - Click "Analytics" tab
   - See your learning stats
   - View topic mastery levels
   - Get personalized study recommendations

## Architecture

```
┌─────────────────┐
│   Frontend      │  http://localhost:3000
│   (Next.js)     │
└────────┬────────┘
         │
         │ HTTP API
         ▼
┌─────────────────┐
│   Backend       │  http://localhost:8000
│   (FastAPI)     │
└────────┬────────┘
         │
         ├──────► ChromaDB (Vector Store)
         ├──────► SQLite (Conversations & Quizzes)
         └──────► Ollama/Mistral-7B (LLM)
                  http://localhost:11434
```

## Data Persistence

All data is stored locally in `./data/`:
- `uploads/` - Uploaded documents
- `vectordb/` - ChromaDB vector embeddings
- `cache/` - Temporary files
- `conversations.db` - Chat history & quiz data

## Development

### Hot Reload Enabled
- Backend: Code changes auto-reload (uvicorn --reload)
- Frontend: Next.js fast refresh

### Edit Code
```bash
# Backend
code backend/app/

# Frontend
code frontend/
```

Changes appear immediately!

## Security Notes

- 🔒 100% Local - No data leaves your machine
- 🔒 No API keys required
- 🔒 Ollama runs locally
- 🔒 All processing happens on your hardware

## Support

**Issue:** Backend won't start
**Fix:** Check Ollama is running: `curl http://localhost:11434/api/tags`

**Issue:** Frontend can't reach backend
**Fix:** Verify backend is on port 8000: `curl http://localhost:8000/health`

**Issue:** Slow quiz generation
**Fix:** Normal - LLM generates each question (15-30s for 10 questions)

**Issue:** Want to use different LLM model
**Fix:** Edit `docker-compose.yml`, change `OLLAMA_MODEL=mistral:7b` to your model

---

**Built by:** Abhishek
**Total Code:** ~4,174 lines (Phase 4)
**Git Commits:** 4 phases, complete implementation
