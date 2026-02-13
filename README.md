# Guru-Agent (Project Cortex) - Phase 1

## Active Cognitive Learning OS - Local RAG Foundation

**Team:** ZenForge
**Event:** AMD Slingshot Hackathon
**Version:** 0.1.0 - Phase 1
**Status:** Core Foundation Complete
**Privacy:** 100% Local Execution

---

## Overview

Guru-Agent is a local-first AI learning companion that provides personalized, empathetic educational support without relying on cloud services. Phase 1 establishes the core RAG (Retrieval-Augmented Generation) pipeline with generative UI capabilities.

### Phase 1 Features

✅ **Document Processing**: Upload and process PDF, PowerPoint, and Word documents
✅ **Local Vector Storage**: ChromaDB with sentence-transformers embeddings
✅ **Local LLM Inference**: Ollama integration (Mistral-7B)
✅ **Generative UI**: Automatic Mermaid.js diagram generation
✅ **Next.js Frontend**: Modern, responsive chat interface
✅ **Zero Cloud Dependency**: All processing happens locally

---

## Architecture

```
┌─────────────────┐
│   Next.js UI    │
│  (Port 3000)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FastAPI Backend│
│  (Port 8000)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│ChromaDB│ │  Ollama  │
│ Vector │ │   LLM    │
│  Store │ │(Port     │
└────────┘ │ 11434)   │
           └──────────┘
```

---

## Quick Start

### 🐳 Option 1: Docker (Recommended - Works Perfectly!)

**Requirements**: Docker Desktop installed ([Get Docker](https://docs.docker.com/get-docker/))

```bash
# Windows
scripts\docker-start.bat

# Linux/Mac
chmod +x scripts/docker-start.sh
./scripts/docker-start.sh
```

**That's it!** Full RAG system with ChromaDB, embeddings, and document processing. No dependency issues!

See [docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md) for details.

---

### 💻 Option 2: Native Installation (Advanced)

### Prerequisites

1. **Python 3.10+**
2. **Node.js 18+**
3. **Ollama** (for local LLM)

### Installation

#### 1. Install Ollama & Pull Model

```bash
# Install Ollama (visit https://ollama.ai for your OS)
curl -fsSL https://ollama.ai/install.sh | sh

# Pull Mistral model
ollama pull mistral:7b

# Verify
ollama list
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local
```

### Running the Application

**Terminal 1: Backend**
```bash
cd backend
source venv/bin/activate
python -m app.main
```
Backend: `http://localhost:8000` | Docs: `http://localhost:8000/docs`

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```
Frontend: `http://localhost:3000`

---

## Usage

1. **Upload Documents**: Click "Upload Documents" and select PDF/PPTX/DOCX files
2. **Ask Questions**: Type your question about the uploaded materials
3. **View Responses**: Get AI-generated answers with source citations and auto-generated diagrams

---

## Project Structure

```
ZenForge/
├── backend/                     # Python FastAPI
│   ├── app/
│   │   ├── main.py             # Entry point
│   │   ├── config.py           # Configuration
│   │   ├── models/             # Pydantic schemas
│   │   ├── services/           # Core logic (RAG, LLM, Vector DB)
│   │   └── routers/            # API endpoints
│   └── requirements.txt
│
├── frontend/                    # Next.js TypeScript
│   ├── app/                    # App router
│   ├── components/             # React components
│   ├── lib/                    # API client
│   └── package.json
│
└── data/                       # Local storage (gitignored)
    ├── uploads/                # User documents
    ├── vectordb/               # ChromaDB
    └── cache/                  # Temp files
```

---

## Configuration

### Backend (`.env`)

```bash
OLLAMA_MODEL=mistral:7b
EMBEDDING_MODEL=all-MiniLM-L6-v2
CHUNK_SIZE=1000
TOP_K_RETRIEVAL=4
```

### Frontend (`.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Troubleshooting

**Ollama Offline**
```bash
ollama serve
ollama pull mistral:7b
```

**No Documents Indexed**
- Upload documents first via UI
- Check backend logs for errors

**Frontend Connection Error**
- Ensure backend is running on port 8000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

---

## Roadmap

**Phase 2:** Multimodal & Multilingual (Vision tracking, Voice input, TTS)
**Phase 3:** Personalized Assessment (Hints, Rubrics, Role reversal)
**Phase 4:** Mastery Tracking (Spaced repetition, Gamification)

---

## License

Private project - AMD Slingshot Hackathon

---

**Built with ❤️ for privacy-conscious learners**
