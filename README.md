# 🚀 ZenForge - AI-Powered Learning Platform

> **A Comprehensive AI Learning Companion for Equitable Education** — Built by Team ZenForge for the Google Solution Challenge 2026

[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/Status-Phase%204%20MVP-blue)]()

---

## 📋 Overview

**ZenForge** is a full-stack, intelligent **AI Learning Companion** combining Retrieval-Augmented Generation (RAG), multimodal capabilities, and advanced assessment features. It delivers personalized, engaging learning experiences with a modern Next.js frontend and powerful FastAPI backend—designed for offline-first usage and local privacy.

### Why ZenForge?

- **🔒 Privacy-First:** 100% local processing with optional cloud integration for scalability
- **🌍 Equitable Access:** Enables learning without internet dependency—perfect for underserved communities
- **⚡ Zero-Friction Setup:** Single-command Docker deployment or native setup scripts
- **🎓 Intelligent Assessment:** AI-powered quiz generation, spaced repetition (SM-2), and mastery tracking
- **👁️ Attention-Aware:** Real-time focus monitoring via webcam for engagement insights
- **🎤 Multimodal Learning:** Voice input, text-to-speech, image processing, and podcast generation
- **📊 Data-Driven:** Comprehensive learning analytics and personalized study recommendations
- **🔌 Offline-Capable:** Works completely offline after initial model download with local vector database

---

## 🌟 Key Features

### 📚 **Phase 1: Document Intelligence & RAG Foundation**
- **Multi-Format Support:** PDF, DOCX, PPTX, TXT document processing
- **Intelligent Chunking:** Semantic text segmentation for optimal retrieval
- **Vector Database:** ChromaDB with sentence-transformers embeddings
- **Semantic Search:** AI-powered similarity matching across document corpus
- **Citation Tracking:** Precise source attribution for all retrieved content

### 🤖 **Phase 2: Multimodal Capabilities**
- **Image Processing:** Upload and analyze images with local vision models
- **Audio Transcription:** Speech-to-text without external APIs
- **Text-to-Speech:** Natural voice synthesis for accessibility
- **Multi-Language Support:** Process documents in various languages

### 💬 **Phase 3: Conversation Management**
- **Persistent History:** SQLite-backed conversation storage
- **Context Windows:** Intelligent context management for long conversations
- **Query Rewriting:** Smart reformulation for improved retrieval
- **Multi-Turn Dialogue:** Maintain coherent context across multiple exchanges
- **Conversation Search:** Filter and retrieve past interactions

### 🎯 **Phase 4: Advanced Assessment & Learning Analytics**
- **AI-Powered Quiz Generation:** Automatic MCQ, True/False, and short-answer creation
- **Spaced Repetition (SM-2):** Scientifically-proven SRS algorithm for retention
- **Mastery Tracking:** Monitor learning progression (Novice → Intermediate → Advanced)
- **Topic Extraction:** Automatic learning objective identification
- **Learning Analytics:** Detailed insights on study patterns, performance metrics, and progress
- **Personalized Recommendations:** AI-driven study suggestions based on performance
- **Attention Monitoring:** Real-time focus detection via webcam (MediaPipe, OpenCV)
- **Study Planning:** Intelligent learning path recommendations

---

## 🛠️ Technology Stack

| Component | Technologies | Purpose |
|-----------|--------------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | Modern SSR web interface |
| | Tailwind CSS, Framer Motion | Responsive UI & animations |
| | Mermaid.js, react-markdown | Diagram & content rendering |
| | Axios | HTTP API communication |
| **Backend API** | FastAPI, Uvicorn, Python 3.11+ | High-performance REST API |
| | Pydantic, SQLAlchemy | Data validation & ORM |
| **RAG/ML** | ChromaDB | Vector database & storage |
| | sentence-transformers | Embedding generation |
| | LangChain | RAG orchestration |
| | PyPDF2, python-docx, python-pptx | Document parsing |
| **Computer Vision** | MediaPipe, OpenCV | Attention tracking & image processing |
| **Speech** | speech-recognition, pyttsx3 | Voice input & TTS |
| **LLM Inference** | Ollama | Local model serving |
| | Mistral-7B, Llama-3.2 | Open-source language models |
| **Databases** | SQLite | Conversations, quizzes, analytics |
| | ChromaDB | Vector embeddings persistence |
| **DevOps** | Docker, Docker Compose | Containerization & orchestration |
| **Cloud** | Google Cloud Run (optional) | Serverless deployment |

---

## 🚀 Quick Start

### Prerequisites

- **Operating System:** Windows, macOS, or Linux
- **Option A (Docker):** Docker Desktop & Docker Compose installed
- **Option B (Native):** Python 3.11+, Node.js 18+, and Ollama
- **Hardware:** Minimum 8GB RAM (16GB+ recommended for optimal performance)
- **Ollama:** Pre-installed with a model pulled (e.g., `ollama pull mistral` or `ollama pull llama2`)

### Option 1: Docker Setup (Recommended - One Command)

```bash
# Clone repository
git clone https://github.com/Paritosh2681/ZenForge.git
cd ZenForge

# Start complete system (Windows)
.\docker-compose.full.yml up -d

# Or on macOS/Linux
docker-compose -f docker-compose.full.yml up -d

# View logs
docker-compose logs -f
```

**Access URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Ollama: http://localhost:11434

**Stop services:**
```bash
docker-compose down
```

### Option 2: Docker with Minimal Setup

For systems with limited resources:

```bash
docker-compose -f docker-compose.yml up -d
docker-compose logs -f
```

### Option 3: Native Installation (Manual Setup)

#### Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Or macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup (new terminal)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Next.js dev server
npm run dev
```

Access at http://localhost:3000

### Option 4: Offline Setup (No Internet Required)

```bash
# Windows
.\Setup-Offline-AI.bat

# macOS/Linux
./scripts/setup.sh
```

This sets up a fully offline environment with local models.

---

## 📁 Project Structure

```
ZenForge/
├── README.md                           # Main documentation (you are here)
├── QUICKSTART.md                       # Quick reference guide
├── MVP_SNAPSHOT.md                     # Current MVP status
├── docker-compose.yml                  # Basic compose config
├── docker-compose.full.yml             # Full stack with Ollama
│
├── backend/                            # Python FastAPI Application
│   ├── app/
│   │   ├── main.py                     # FastAPI app initialization
│   │   ├── config.py                   # Configuration & settings
│   │   ├── models/
│   │   │   ├── schemas.py              # Base Pydantic models
│   │   │   ├── conversation_schemas.py # Conversation data models
│   │   │   └── quiz_schemas.py         # Quiz data models
│   │   ├── services/
│   │   │   ├── llm_client.py           # Ollama LLM integration
│   │   │   ├── rag_engine.py           # RAG orchestration
│   │   │   ├── document_processor.py   # Document parsing (PDF/DOCX/PPTX)
│   │   │   ├── document_registry.py    # Document metadata management
│   │   │   ├── conversation_manager.py # Conversation state management
│   │   │   ├── quiz_manager.py         # Quiz generation & execution
│   │   │   ├── assessment_generator.py # LLM-based question generation
│   │   │   ├── mastery_tracker.py      # Learning progress tracking
│   │   │   ├── analytics_engine.py     # Learning analytics & insights
│   │   │   ├── attention_tracker.py    # Webcam-based focus monitoring
│   │   │   ├── context_window_manager.py # Context length management
│   │   │   ├── database.py             # SQLite ORM & initialization
│   │   │   └── text_to_speech.py       # TTS synthesis
│   │   └── routers/
│   │       ├── documents.py            # Document upload & management
│   │       ├── chat.py                 # Query/chat endpoints
│   │       ├── conversations.py        # Conversation endpoints
│   │       ├── assessments.py          # Quiz & assessment endpoints
│   │       ├── analytics.py            # Analytics endpoints
│   │       ├── multimodal.py           # Image & audio processing
│   │       ├── code_execution.py       # Code execution endpoints
│   │       ├── podcast.py              # Podcast generation endpoints
│   │       ├── protege.py              # Mentoring/tutoring endpoints
│   │       └── study_planner.py        # Study plan recommendation
│   ├── requirements.txt                # Full dependencies
│   ├── requirements-minimal.txt        # Minimal setup dependencies
│   ├── requirements-basic.txt          # Basic setup
│   ├── Dockerfile                      # Container image definition
│   └── test_app.py                     # Application tests
│
├── frontend/                           # Next.js React Application
│   ├── app/
│   │   ├── page.tsx                    # Home/dashboard page
│   │   ├── page-edu.tsx                # Education mode page
│   │   ├── layout.tsx                  # Root layout & providers
│   │   ├── globals.css                 # Global styles
│   │   └── dashboard/                  # Dashboard sub-pages
│   ├── components/
│   │   ├── ChatInterface.tsx           # Main chat component
│   │   ├── DocumentUploader.tsx        # Document upload UI
│   │   ├── QuizInterface.tsx           # Quiz taking component
│   │   ├── QuizList.tsx                # Quiz listing
│   │   ├── QuizResults.tsx             # Results display
│   │   ├── AssessmentHub.tsx           # Assessment dashboard
│   │   ├── LearningDashboard.tsx       # Main learning dashboard
│   │   ├── TopicMasteryCard.tsx        # Mastery visualization
│   │   ├── AttentionMonitor.tsx        # Focus monitoring UI
│   │   ├── BadgesDisplay.tsx           # Achievement badges
│   │   ├── StudyPlanner.tsx            # Study planning interface
│   │   ├── PodcastPlayer.tsx           # Audio playback
│   │   ├── ProtegeMode.tsx             # Mentoring interface
│   │   ├── CodeSandbox.tsx             # Code execution UI
│   │   ├── MermaidRenderer.tsx         # Diagram rendering
│   │   ├── VoiceInput.tsx              # Voice recording
│   │   ├── EyeDetectionOverlay.tsx     # Attention tracking UI
│   │   └── FeaturesGrid.tsx            # Feature showcase
│   ├── lib/
│   │   └── api-client.ts               # API communication
│   ├── types/
│   │   ├── conversation.ts             # Conversation types
│   │   ├── quiz.ts                     # Quiz types
│   │   └── analytics.ts                # Analytics types
│   ├── package.json                    # Node dependencies
│   ├── tsconfig.json                   # TypeScript config
│   ├── tailwind.config.js              # Tailwind CSS config
│   └── Dockerfile                      # Frontend container
│
├── docs/                               # Documentation
│   ├── DOCKER_SETUP.md                 # Docker setup guide
│   ├── PHASE_1_SPEC.md                 # Phase 1 specification
│   ├── PHASE_2_SPEC.md                 # Phase 2 specification
│   ├── PHASE3_SPEC.md                  # Phase 3 specification
│   ├── PHASE4_SPEC.md                  # Phase 4 specification
│   ├── PHASE4_PLAN.md                  # Phase 4 planning
│   └── PHASE4_SUMMARY.md               # Phase 4 summary
│
├── scripts/                            # Utility scripts
│   ├── setup.sh                        # Linux/macOS setup
│   ├── setup.bat                       # Windows setup
│   ├── docker-start.sh                 # Docker start script
│   └── docker-start.bat                # Docker start (Windows)
│
├── models/                             # ML model storage (local)
└── ollama/                             # Ollama configuration
│   ├── components/                # React components
│   │   ├── ChatInterface.tsx      # Chat UI
│   │   ├── DocumentUploader.tsx   # File upload
│   │   ├── MermaidRenderer.tsx    # Diagram rendering
│   │   ├── AssessmentHub.tsx      # Quiz interface
│   │   └── AnalyticsDashboard.tsx # Analytics display
│   ├── lib/
│   │   └── api-client.ts          # API integration
│   ├── public/                    # Static assets
│   ├── package.json               # NPM dependencies
│   ├── tsconfig.json              # TypeScript config
│   ├── tailwind.config.js         # Tailwind CSS config
│   ├── next.config.js             # Next.js config
│   └── Dockerfile                 # Container image
│
├── data/                          # Local Data Storage
│   ├── uploads/                   # Uploaded documents
│   ├── vectordb/                  # ChromaDB storage
│   ├── cache/                     # Cached models
│   ├── conversations.db           # SQLite database
│   └── analytics/                 # Learning data
│
├── docs/                          # Comprehensive Documentation
│   ├── PHASE_1_SPEC.md           # Phase 1 specification
│   ├── PHASE_2_SPEC.md           # Phase 2 specification
│   ├── PHASE_3_SPEC.md           # Phase 3 specification
│   ├── PHASE_4_SPEC.md           # Phase 4 specification
│   ├── PHASE_4_SUMMARY.md        # Implementation summary
│   ├── DOCKER_SETUP.md           # Docker guide
│   └── ARCHITECTURE.md           # System architecture
│
├── scripts/                       # Utility Scripts
│   ├── docker-start.bat          # Windows Docker launcher
│   ├── docker-start.sh           # Linux/Mac Docker launcher
│   ├── setup.bat                 # Windows setup
│   └── setup.sh                  # Linux/Mac setup
│
├── docker-compose.yml             # Main Docker configuration
├── docker-compose.full.yml        # Full stack with Ollama
└── .gitignore                     # Git ignore rules
```

---

## 🔄 How It Works

### 📖 Document Processing Pipeline
```
User Upload (PDF/DOCX/PPTX/TXT)
    ↓
[Text Extraction] (PyPDF2, python-docx, python-pptx)
    ↓
[Intelligent Chunking] (Semantic segmentation)
    ↓
[Embedding Generation] (sentence-transformers)
    ↓
[Vector Storage] (ChromaDB indexed database)
```

### 💬 Query & Response Pipeline
```
User Question
    ↓
[Query Embedding] (Convert to vector)
    ↓
[Semantic Retrieval] (Find similar chunks)
    ↓
[Context Assembly] (Combine with document metadata)
    ↓
[LLM Generation] (Ollama processes with context)
    ↓
[Response Streaming] (Real-time delivery to frontend)
    ↓
[Conversation Storage] (Persist in SQLite)
```

### 🎓 Assessment & Learning Pipeline
```
Document Upload
    ↓
[Automatic Topic Extraction] (Identify key concepts)
    ↓
[Quiz Generation] (LLM creates questions)
    ↓
[Answer Validation] (Evaluate user responses)
    ↓
[SM-2 Scheduling] (Calculate review intervals)
    ↓
[Mastery Tracking] (Update learning levels)
    ↓
[Analytics Update] (Generate insights & recommendations)
```

### 👁️ Attention Tracking Pipeline
```
User Starts Learning
    ↓
[Webcam Activation] (MediaPipe initialization)
    ↓
[Face Detection] (Real-time gaze tracking)
    ↓
[Focus Scoring] (Calculate attention percentage)
    ↓
[Alert Generation] (Notify if focus drops)
    ↓
[Metrics Storage] (Record in analytics database)
```

---

## 📚 Supported Document Formats

| Format | Extension | Status | Use Case |
|--------|-----------|--------|----------|
| **PDF** | `.pdf` | ✅ Fully Supported | Textbooks, research papers, manuals |
| **Word** | `.docx` | ✅ Fully Supported | Lecture notes, documents |
| **PowerPoint** | `.pptx` | ✅ Fully Supported | Presentations, slides |
| **Plain Text** | `.txt`, `.md` | ✅ Fully Supported | Notes, markdown files |
| **Code** | `.py`, `.js`, `.java` | ✅ Fully Supported | Learning programming |
| **Images** | `.jpg`, `.png`, `.gif` | ✅ Via ML models | Visual content analysis |

---

## 🎓 Feature Implementation Status

### ✅ Phase 1: Core RAG Foundation - COMPLETE
- Document upload and multi-format support
- Intelligent text chunking
- Vector embeddings with ChromaDB
- Semantic search capabilities
- RAG-enhanced chat interface
- Ollama LLM integration
- RESTful API with FastAPI

### ✅ Phase 2: Multimodal Integration - COMPLETE
- Image upload and analysis
- Real-time attention tracking via webcam
- Voice input (speech-to-text)
- Text-to-speech synthesis
- Multi-language document support
- Vision-language capabilities

### ✅ Phase 3: Conversation Management - COMPLETE
- Persistent conversation history
- Context window optimization
- Smart query rewriting
- Conversation filtering and search
- Session management
- Data export functionality

### ✅ Phase 4: Assessment & Analytics - COMPLETE
- **Quiz Generation:** MCQ, True/False, Short Answer
- **Automatic Grading:** LLM-based evaluation
- **Spaced Repetition (SM-2):** Research-backed algorithm
- **Mastery Tracking:** Novice → Intermediate → Advanced
- **Learning Analytics:** Performance insights and dashboards
- **Study Recommendations:** Personalized learning paths
- **Topic Extraction:** Automatic learning objectives
- **Progress Visualization:** Charts and statistics

---

## 🔒 Privacy, Security & Data Sovereignty

### Privacy-First Architecture
- **Zero External APIs:** All processing happens locally
- **No Telemetry:** No usage tracking or analytics collection
- **No Authentication Required:** Works offline without login
- **No Data Sharing:** Your data never leaves your machine

### Data Storage & Control
All data is stored locally in the `./data` directory:
- `./data/uploads/` - Uploaded documents
- `./data/vectordb/` - ChromaDB embeddings
- `./data/conversations.db` - Chat and quiz history
- `./data/analytics/` - Learning metrics

**Complete Ownership:** You have full control and can delete or backup data anytime.

### Security Best Practices
- CORS configured for localhost only
- Input validation on all endpoints
- Secure file upload with type checking
- Rate limiting on API endpoints
- No sensitive data in logs
- SQLite encryption-ready

### Offline Capability
ZenForge works completely offline:
1. Download and cache required models during initial setup
2. All document processing occurs locally
3. Vector embeddings generated on-device
4. LLM inference via local Ollama instance
5. No internet connection needed for core features

**Setup for Offline Use:**
```bash
# Windows
.\Setup-Offline-AI.bat

# macOS/Linux
./scripts/setup.sh

# Verify: Disconnect internet and launch application
```

---

## 🌐 API Documentation

### Auto-Generated Interactive Docs
Once backend is running, visit:
```
http://localhost:8000/docs        # Swagger UI
http://localhost:8000/redoc       # ReDoc documentation
```

### Core API Endpoints

#### Document Management
- `POST /api/v1/documents/upload` - Upload documents
- `GET /api/v1/documents` - List all documents
- `GET /api/v1/documents/{doc_id}` - Get document details
- `DELETE /api/v1/documents/{doc_id}` - Delete document

#### Chat & Retrieval
- `POST /api/v1/chat/query` - Query with streaming response
- `GET /api/v1/chat/history` - Get conversation history
- `GET /api/v1/conversations` - List all conversations
- `DELETE /api/v1/conversations/{conv_id}` - Delete conversation

#### Assessment & Quizzes
- `POST /api/v1/assessments/generate` - Generate quiz
- `POST /api/v1/assessments/submit` - Submit quiz answer
- `GET /api/v1/assessments/results` - Get quiz results
- `GET /api/v1/assessments/mastery` - Get mastery levels

#### Learning Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard metrics
- `GET /api/v1/analytics/progress` - Learning progress
- `GET /api/v1/analytics/recommendations` - Study recommendations
- `GET /api/v1/analytics/export` - Export learning data

#### System
- `GET /api/v1/health` - System health check
- `GET /api/v1/config` - Current configuration

---

## 🐳 Docker Deployment

### Quick Start with Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.full.yml up -d

# View service status
docker ps
docker-compose ps

# Check logs
docker-compose logs -f              # All services
docker-compose logs -f backend      # Backend only
docker-compose logs -f frontend     # Frontend only

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v
```

### Building Individual Containers

```bash
# Build backend image
docker build -t zenforge-backend:latest ./backend

# Build frontend image  
docker build -t zenforge-frontend:latest ./frontend

# Run backend
docker run -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  zenforge-backend:latest

# Run frontend
docker run -p 3000:3000 \
  zenforge-frontend:latest
```

### Custom Docker Configuration

Edit `docker-compose.yml`:
```yaml
backend:
  environment:
    - EMBEDDING_MODEL=all-MiniLM-L6-v2
    - LLM_MODEL=mistral
    - CHUNK_SIZE=500
    - MAX_UPLOAD_SIZE_MB=100
```

---

## ☁️ Google Cloud Deployment

ZenForge is optimized for Google Cloud with automated deployment using Ollama sidecars for local inference.

### Prerequisites
- Google Cloud SDK (`gcloud` CLI)
- Active GCP Project with Billing enabled
- Authentication: `gcloud auth login`

### Deployment Script (5 Minutes)

```bash
# Configure your GCP project
gcloud config set project YOUR_PROJECT_ID

# Run deployment script
sh scripts/gcp-deploy.sh
```

This automates:
- Building container images
- Pushing to Google Artifact Registry
- Deploying backend to Cloud Run
- Deploying frontend to Cloud Run
- Configuring Ollama sidecar for inference
- Setting up environment variables

### Cloud Architecture
```
User Browser
    ↓
Frontend (Cloud Run)
    ↓
Backend API (Cloud Run)
    ↓
Ollama Sidecar (Local inference)
    ↓
Local Vector Database (Cloud Storage)
```

### Benefits of Cloud Deployment
- ⚡ Global CDN for frontend
- 🔄 Auto-scaling backend
- 💾 Persistent storage on Cloud Storage
- 🔒 Data still processed locally via Ollama sidecar
- 💰 Pay only for resources used

---

## ⚙️ Configuration Guide

### Backend Configuration
Edit `backend/app/config.py`:

```python
# LLM and Embedding Models
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # Fast embedding model
LLM_MODEL = "mistral"                  # Open-source LLM
OLLAMA_BASE_URL = "http://localhost:11434"

# Vector Database
CHUNK_SIZE = 500           # Characters per chunk
CHUNK_OVERLAP = 50         # Overlap for context
EMBED_BATCH_SIZE = 32      # Embeddings per batch

# API Configuration
MAX_UPLOAD_SIZE_MB = 100
API_RATE_LIMIT = 100       # Requests per minute
CORS_ORIGINS = ["http://localhost:3000"]

# Database
DATABASE_URL = "sqlite:///./data/conversations.db"

# Learning
SM2_EASY_FACTOR = 2.5
SM2_HARD_FACTOR = 1.3
```

### Frontend Configuration
Edit `frontend/lib/api-client.ts`:

```typescript
// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
                            'http://localhost:8000';

// Timeouts (milliseconds)
export const REQUEST_TIMEOUT = 30000;
export const STREAM_TIMEOUT = 120000;

// UI Settings
export const ITEMS_PER_PAGE = 10;
export const AUTO_SAVE_INTERVAL = 5000;
```

### Environment Variables

Create `.env.local` in frontend:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=ZenForge
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
```

---

## 🚀 Performance Optimization

### Backend Optimization
```python
# 1. Use faster embedding model
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # vs all-mpnet-base-v2

# 2. Optimize chunk size
CHUNK_SIZE = 300        # Smaller = faster retrieval
CHUNK_OVERLAP = 30      # Reduce overlap

# 3. Batch processing
# Embed multiple documents together for efficiency

# 4. Cache embeddings
# Reuse embeddings for duplicate content
```

### Frontend Optimization
```typescript
// 1. Code splitting
// 2. Image optimization
// 3. Lazy loading components
// 4. API response caching
```

### Infrastructure
- Use SSD storage for ChromaDB
- Allocate adequate RAM (16GB recommended)
- Enable GPU acceleration if available
- Monitor vector database size

---

## 📖 Documentation Resources

- **[QUICKSTART.md](QUICKSTART.md)** - Fast setup guide (5 minutes)
- **[MVP_SNAPSHOT.md](MVP_SNAPSHOT.md)** - Current MVP status
- **[docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md)** - Detailed Docker guide
- **[docs/PHASE_4_SPEC.md](docs/PHASE_4_SPEC.md)** - Phase 4 features
- **[docs/PHASE_4_PLAN.md](docs/PHASE_4_PLAN.md)** - Implementation plan

---

## 🐛 Troubleshooting

### Backend Issues

**Backend won't start:**
```bash
# Check Python version (requires 3.11+)
python --version

# Verify port availability
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check Ollama connection
curl http://localhost:11434/api/tags
```

**API returns 500 error:**
```bash
# View backend logs
docker-compose logs backend -f

# Check database
ls -la data/conversations.db

# Reset database if corrupted
rm data/conversations.db && python backend/app/database.py
```

### Frontend Issues

**"Connection refused" error:**
```bash
# Verify backend is running
curl http://localhost:8000/api/v1/health

# Check frontend env
cat frontend/.env.local

# Rebuild frontend
cd frontend && npm run build
```

**High memory usage:**
```bash
# Clear Next.js cache
rm -rf frontend/.next

# Clear browser cache (Ctrl+Shift+Delete)

# Restart containers
docker-compose restart
```

### Ollama Issues

**Model not loading:**
```bash
# List available models
ollama list

# Pull required model
ollama pull mistral
ollama pull llama2

# Check Ollama status
curl http://localhost:11434/api/tags

# Restart Ollama
docker-compose restart ollama
```

**Out of memory:**
```bash
# Use smaller model
ollama pull mistral  # 7B model (lighter)

# Or reduce context window
OLLAMA_NUM_PREDICT=512  # Limit response length
```

---

## 🤝 Contributing

We welcome contributions! Help us build the future of equitable AI learning.

### Getting Started
1. Fork the repository on GitHub
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/ZenForge.git`
3. Create feature branch: `git checkout -b feature/your-feature`
4. Make changes and test locally
5. Commit: `git commit -m 'Add your feature'`
6. Push: `git push origin feature/your-feature`
7. Open Pull Request with description

### Development Guidelines
- Follow PEP 8 (Python) and ESLint (TypeScript) standards
- Add tests for new features
- Update documentation
- Test in Docker environment
- Use meaningful commit messages

### Contributing Areas
- 🐛 Bug fixes and improvements
- ✨ New features (Phase 5 and beyond)
- 📚 Documentation and guides
- 🎨 UI/UX enhancements
- 🚀 Performance optimizations
- 🌍 Localization and translations
- 🧪 Testing and quality assurance
- 📊 Analytics and metrics

### Code of Conduct
Please treat all community members with respect and courtesy.

---

## 📋 Roadmap

### ✅ Completed
- Phase 1: RAG Foundation
- Phase 2: Multimodal Capabilities
- Phase 3: Conversation Management
- Phase 4: Assessment & Learning Analytics
- MVP for Google Solution Challenge 2026

### 🎯 Planned Features
- Phase 5: Collaborative Learning
  - Real-time document collaboration
  - Shared study sessions
  - Peer review functionality
  
- Advanced Analytics
  - Predictive learning paths
  - Cohort analysis
  - Achievement system
  
- Mobile Applications
  - iOS/Android native apps
  - Offline-first synchronization
  
- Extensibility
  - Plugin system
  - Custom model support
  - API webhooks
  
- Enterprise Features
  - Multi-user management
  - Organization workspaces
  - Advanced permissions
  - Audit logging

---

## 📊 Technical Statistics

| Metric | Value |
|--------|-------|
| **Backend Code** | ~3000+ lines (FastAPI/Python) |
| **Frontend Code** | ~4000+ lines (React/TypeScript) |
| **Documentation** | 10+ comprehensive guides |
| **API Endpoints** | 25+ RESTful endpoints |
| **Supported Models** | 50+ via Ollama |
| **Document Formats** | 6+ types |
| **Database Tables** | 10+ SQLite tables |
| **Services** | 10+ backend microservices |
| **React Components** | 20+ reusable components |

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for full details.

### MIT License Allows
- ✅ Free use for personal and commercial projects
- ✅ Modification and distribution
- ✅ Private use

### MIT License Requires
- ✅ License and copyright notice in distributions
- ❌ No liability
- ❌ No warranty

---

## 🙏 Acknowledgments & Credits

### Built For
- **Google Solution Challenge 2026** - The organizing event
- **Global Education Community** - Inspiring equitable learning

### Core Technologies & Projects
- [FastAPI](https://fastapi.tiangolo.com/) - Modern REST API framework
- [Next.js](https://nextjs.org/) - React production framework
- [ChromaDB](https://www.trychroma.com/) - Vector database
- [Ollama](https://ollama.ai/) - Local LLM platform
- [LangChain](https://python.langchain.com/) - LLM orchestration framework
- [sentence-transformers](https://www.sbert.net/) - Embedding models
- [PyPDF2](https://github.com/py-pdf/PyPDF2) - PDF processing
- [MediaPipe](https://mediapipe.dev/) - ML framework for vision

### Team ZenForge
- Paritosh Sharma (Lead Developer)
- Backend Architecture & RAG
- Frontend UI/UX
- DevOps & Deployment

### Community Contributors
- Open source maintainers
- Hackathon mentors
- Early testers and feedback providers

---

## 💬 Support & Communication

### Get Help
1. **Read Documentation First:** Check [docs/](docs/) and [QUICKSTART.md](QUICKSTART.md)
2. **Search Issues:** Look for similar issues on [GitHub Issues](../../issues)
3. **Create New Issue:** Use templates for bugs or feature requests
4. **Community Discussion:** Join [GitHub Discussions](../../discussions)

### Report Issues
When reporting a bug, include:
- Operating system and version
- Python/Node.js version
- Steps to reproduce
- Expected vs actual behavior
- Relevant error messages/logs
- (Optional) Screenshots

### Feature Requests
Describe:
- Desired functionality
- Use case and benefit
- Suggested implementation approach
- Related existing features

---

## 🎉 Conclusion

**ZenForge** represents a paradigm shift in AI-assisted learning—combining cutting-edge AI capabilities with privacy-first architecture and offline functionality. Our mission is to make equitable, high-quality AI-powered education accessible to everyone, regardless of connectivity or resources.

### Our Vision
Build a learning platform that:
- Prioritizes user privacy and data sovereignty
- Works in resource-constrained environments  
- Provides personalized, effective learning experiences
- Empowers educators and learners globally
- Remains completely open and transparent

**Join us on this mission to democratize AI-powered learning.**

---

## 📞 Quick Links

- GitHub Repository: https://github.com/Paritosh2681/ZenForge
- Google Solution Challenge: https://solutionchallengegsoc2026.withgoogle.com
- Ollama Documentation: https://ollama.ai
- FastAPI Docs: https://fastapi.tiangolo.com
- Next.js Docs: https://nextjs.org/docs

---

**Last Updated:** April 26, 2026
**Status:** Phase 4 MVP Complete | Ready for Google Solution Challenge
**License:** MIT

<div align="center">

**GuruCortex | Built with ❤️ by Team ZenForge**

⭐ If you find this project useful, please consider giving it a star! ⭐

</div>
