# Docker Setup Guide - Complete RAG System

## Quick Start (Recommended)

### Prerequisites
1. **Install Docker Desktop**
   - Windows: https://docs.docker.com/desktop/windows/install/
   - Mac: https://docs.docker.com/desktop/mac/install/
   - Linux: https://docs.docker.com/engine/install/

### Option 1: Use Host Ollama (Faster)

If you already have Ollama installed:

```bash
# Windows
scripts\docker-start.bat

# Linux/Mac
chmod +x scripts/docker-start.sh
./scripts/docker-start.sh
```

This will:
- ✅ Build backend with all dependencies (ChromaDB, sentence-transformers, etc.)
- ✅ Build frontend (Next.js)
- ✅ Connect to your existing Ollama on localhost:11434
- ✅ Start everything with one command!

### Option 2: Full Docker Stack (Everything Containerized)

Run Ollama in Docker too:

```bash
docker-compose -f docker-compose.full.yml up --build -d

# Pull Mistral model (first time only)
docker exec guru-agent-ollama ollama pull mistral:7b
```

---

## What You Get

**With Docker, you get the COMPLETE Phase 1 system:**

✅ **ChromaDB** - Full vector database with persistence
✅ **Sentence Transformers** - Local embedding generation
✅ **Document Processing** - Real PDF/PPT/Word parsing
✅ **Semantic Search** - Vector-based retrieval
✅ **Full RAG Pipeline** - Complete retrieval-augmented generation
✅ **Mistral-7B** - Local LLM inference
✅ **Hot Reload** - Code changes apply instantly

No more dependency hell! No compilation errors!

---

## Access Points

Once running:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Ollama** (if using full): http://localhost:11434

---

## Docker Commands

### Start Everything
```bash
# With host Ollama
docker-compose up -d

# With Docker Ollama
docker-compose -f docker-compose.full.yml up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Everything
```bash
docker-compose down

# With full stack
docker-compose -f docker-compose.full.yml down
```

### Rebuild After Code Changes
```bash
# Backend only
docker-compose up -d --build backend

# Frontend only
docker-compose up -d --build frontend

# Everything
docker-compose up -d --build
```

### Access Container Shell
```bash
# Backend
docker exec -it guru-agent-backend bash

# Frontend
docker exec -it guru-agent-frontend sh

# Ollama (if using full stack)
docker exec -it guru-agent-ollama bash
```

---

## Data Persistence

Docker volumes ensure your data persists:

```
data/
├── uploads/     → Uploaded documents
├── vectordb/    → ChromaDB database
└── cache/       → Temporary files
```

These are mounted as volumes and survive container restarts.

---

## Architecture

### Option 1: Host Ollama (docker-compose.yml)
```
┌─────────────────┐
│  Browser        │
│  localhost:3000 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐    ┌──────────────┐
│  Frontend       │────▶│  Backend     │
│  (Docker)       │    │  (Docker)    │
│  Next.js        │    │  FastAPI     │
└─────────────────┘    └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  ChromaDB    │
                       │  (in backend)│
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │  Ollama      │
                       │  (Host)      │
                       │  :11434      │
                       └──────────────┘
```

### Option 2: Full Docker (docker-compose.full.yml)
```
Everything in Docker containers
(more isolated, portable)
```

---

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <pid> /F

# Linux/Mac
sudo lsof -ti:8000 | xargs kill -9
```

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Rebuild from scratch
docker-compose down
docker-compose up --build
```

### Ollama Connection Failed
```bash
# If using host Ollama, ensure it's running
ollama serve

# If using Docker Ollama
docker exec guru-agent-ollama ollama list
```

### Reset Everything
```bash
# Stop and remove containers
docker-compose down -v

# Remove images
docker rmi guru-agent-backend guru-agent-frontend

# Rebuild
docker-compose up --build
```

---

## Development Workflow

### Hot Reload
Changes to code are automatically detected:

**Backend**:
- Edit files in `backend/app/`
- Changes reload instantly (mounted volume)

**Frontend**:
- Edit files in `frontend/`
- Hot reload via Next.js dev server

### Adding Dependencies

**Backend**:
```bash
# Add to requirements.txt
# Rebuild
docker-compose up -d --build backend
```

**Frontend**:
```bash
# Install in container
docker exec guru-agent-frontend npm install <package>

# Or rebuild
docker-compose up -d --build frontend
```

---

## Production Deployment

### Build Production Images
```bash
# Backend (already production-ready)
docker build -t guru-agent-backend:prod ./backend

# Frontend (production build)
docker build -t guru-agent-frontend:prod -f frontend/Dockerfile ./frontend
```

### Use Docker Hub
```bash
# Tag
docker tag guru-agent-backend:prod yourname/guru-agent-backend:latest

# Push
docker push yourname/guru-agent-backend:latest
```

---

## Performance

### Resource Usage
- **Backend**: ~2GB RAM (ChromaDB + embeddings)
- **Frontend**: ~512MB RAM
- **Ollama**: ~4GB RAM (model in memory)

### Build Times
- **First build**: ~10-15 minutes (downloads all deps)
- **Subsequent builds**: ~2-3 minutes (Docker cache)
- **Hot reload**: Instant

### Model Download
- **Mistral-7B**: ~4.4GB (one-time download)
- **Embeddings**: ~80MB (downloaded on first query)

---

## Comparison: Docker vs Native

| Feature | Docker | Native (Windows/Python 3.12) |
|---------|--------|------------------------------|
| Setup Time | 10-15 min (first build) | 30+ min (compilation issues) |
| Dependency Issues | ✅ None | ❌ Many (lxml, Pillow, Rust) |
| Portability | ✅ Works everywhere | ❌ OS-specific |
| Updates | ✅ Rebuild container | ❌ Reinstall deps |
| Isolation | ✅ Complete | ❌ System-wide |
| Performance | ~5% overhead | Native speed |

**Recommendation**: Use Docker for hassle-free setup!

---

## Next Steps

Once running with Docker:

1. **Test Full RAG**:
   - Upload real PDF/PPTX/DOCX
   - See actual document parsing
   - Experience semantic search
   - Watch embeddings work

2. **Move to Phase 2**:
   - Add MediaPipe (attention tracking)
   - Integrate Whisper (voice input)
   - Implement TTS (audio output)

3. **Deploy to Production**:
   - Use production Dockerfile
   - Set up reverse proxy (nginx)
   - Configure SSL/TLS
   - Scale with Docker Swarm/Kubernetes

---

## Support

**Issues?**
1. Check logs: `docker-compose logs -f`
2. Verify Docker version: `docker --version` (need 20.10+)
3. Check Docker Desktop is running
4. See `DEMO_STATUS.md` for more help

---

**Team ZenForge | AMD Slingshot Hackathon**
**Built with ❤️ for privacy-conscious learners**
