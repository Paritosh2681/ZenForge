# 🚀 GuruCortex - AI Learning Companion

> **A Comprehensive AI Learning Companion for Equitable Education** — Built by Team ZenForge for the Google Solution Challenge 2026

[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/Status-Phase%204%20MVP-blue)]()

---

## 📋 Overview

**GuruCortex** is a full-stack, intelligent **AI Learning Companion** combining Retrieval-Augmented Generation (RAG), multimodal capabilities, and advanced assessment features. It delivers personalized, engaging learning experiences with a modern Next.js frontend and powerful FastAPI backend—designed for offline-first usage and local privacy.

### Why GuruCortex?

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
| | Google Gemma 4 (4B parameters) | Efficient, lightweight language model |
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
- **Ollama:** Pre-installed with model pulled (`ollama pull gemma4:4b`)

### Option 1: Docker Setup (Recommended - One Command)

```bash
# Clone repository
git clone https://github.com/Paritosh2681/GuruCortex.git
cd GuruCortex

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
GuruCortex/
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

### 1️⃣ Document Upload
Users upload documents (PDF, DOCX, PPTX, or TXT) through the web interface.

### 2️⃣ Processing Pipeline
```
Document Upload
    ↓
[Text Extraction] (PyPDF2, python-docx, python-pptx)
    ↓
[Chunking] (Semantic segmentation)
    ↓
[Embedding] (sentence-transformers)
    ↓
[Storage] (ChromaDB Vector Database)
```

### 3️⃣ Query Processing
```
User Question
    ↓
[Embedding] (Convert query to vector)
    ↓
[Retrieval] (Find similar chunks from ChromaDB)
    ↓
[Context Building] (Combine chunks for LLM)
    ↓
[LLM Processing] (Ollama generates response)
    ↓
[Response Delivery] (Streamed to frontend)
```

### 4️⃣ Assessment & Learning
```
User Document
    ↓
[Topic Extraction] (Identify key concepts)
    ↓
[Quiz Generation] (Create questions)
    ↓
[Answer Evaluation] (Check against rubric)
    ↓
[Spaced Repetition] (SM-2 algorithm scheduling)
    ↓
[Analytics Update] (Track progress)
```

---

## 📚 Supported File Types

| Format | Extension | Status |
|--------|-----------|--------|
| Portable Document Format | `.pdf` | ✅ Fully Supported |
| Microsoft Word | `.docx` | ✅ Fully Supported |
| Microsoft PowerPoint | `.pptx` | ✅ Fully Supported |
| Plain Text | `.txt`, `.md` | ✅ Fully Supported |
| Python Code | `.py` | ✅ Fully Supported |
| Images (Analysis) | `.jpg`, `.png`, `.gif` | ✅ Supported via ML |

---

## 🎓 Features Overview

### Phase 1: Core RAG Foundation ✅ COMPLETE
- Document upload and processing
- Vector embedding and search
- Chat interface with context
- Local LLM integration
- API documentation

### Phase 2: Multimodal & Accessibility ✅ COMPLETE
- Image upload and analysis
- Attention tracking (webcam)
- Voice input (Speech Recognition)
- Text-to-Speech output
- Multi-language support

### Phase 3: Conversations & Context ✅ COMPLETE
- Persistent conversation history
- Context window management
- Query rewriting
- Conversation search
- Export functionality

### Phase 4: Assessment & Learning Analytics ✅ COMPLETE
- Quiz generation (MCQ, T/F, Short Answer)
- Automatic grading
- Spaced repetition scheduling
- Mastery level tracking
- Learning analytics dashboard
- Study recommendations

---

## 🔒 Privacy & Security

### Zero Cloud Dependency
- **No external APIs** are called for processing documents
- **No telemetry** or usage tracking
- **No API keys** required for core features
- **All data stays local** in the `./data` directory
GuruCortex
### Offline Capability
GuruCortex works completely offline after initial setup:
1. Documents are processed locally
2. Embeddings are generated and stored locally
3. LLM inference via Ollama (running on your machine)
4. No internet connection needed for core features

### Data Persistence
- **SQLite Database:** Conversations and quiz results
- **ChromaDB:** Vector embeddings for semantic search
- **File Storage:** Uploaded documents in `./data/uploads`
- **You own your data:** Full control and accessibility

### Security Best Practices
- CORS enabled only for localhost
- No sensitive data in logs
- Secure file upload validation
- Rate limiting on API endpoints

---

### Offline Mode Setup

GuruCortex includes dedicated offline setup scripts. All components can run without internet:

```bash
# Automated offline setup (Windows)
.\Setup-Offline-AI.bat

# Or use Python setup (cross-platform)
python setup_offline.py

# Start in offline mode
.\Start-GuruCortex.bat
```

**Offline Verification:**
1. Disconnect from internet
2. Launch GuruCortex
3. Verify document processing, chat, quizzes, and analytics work

See [OFFLINE_MODE.md](OFFLINE_MODE.md) for detailed instructions.

---

## 🌐 API Documentation

### Auto-Generated OpenAPI Docs
Once the backend is running, visit:
```
http://localhost:8000/docs
```

### Key Endpoints

#### Documents
- `POST /api/documents/upload` - Upload a document
- `GET /api/documents` - List uploaded documents
- `DELETE /api/documents/{doc_id}` - Delete a document

#### Chat
- `POST /api/chat/query` - Query documents with streaming response
- `GET /api/chat/history` - Get conversation history
- `DELETE /api/chat/clear` - Clear conversation

#### Assessment
- `POST /api/assessment/generate-quiz` - Generate a quiz
- `POST /api/assessment/submit-answer` - Submit quiz answer
- `GET /api/assessment/results` - Get quiz results
- `GET /api/assessment/analytics` - Get learning analytics

#### Health
- `GET /api/health` - System health status
- `GET /api/config` - Current configuration

---

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Start services
docker-compose -f docker-compose.full.yml up -d

# Check service status
docker ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Building Custom Containers

```bash
# Build just backend
docker build -t gurucortex-backend ./backend

# Build just frontend
docker build -t gurucortex-frontend ./frontend

# Run containers manually
docker run -p 8000:8000 gurucortex-backend
docker run -p 3000:3000 gurucortex-frontend
```

---

## ☁️ Google Cloud Deployment

GuruCortex is optimized for deployment on **Google Cloud Run** using a sidecar architecture for Ollama.

### Prerequisites
- Google Cloud SDK installed and configured
- A Google Cloud Project with Billing enabled

### Deploying in 5 Minutes
1. **Configure gcloud**:
   ```bash
   gcloud config set project [YOUR_PROJECT_ID]
   ```
2. **Run the Deployment Script**:
   ```bash
   sh scripts/gcp-deploy.sh
   ```
This script automates:
- Building and pushing images to **Artifact Registry**
- Deploying the backend to **Cloud Run** with an **Ollama Sidecar**
- Deploying the frontend with the correct API connections

### Sidecar Benefits
By running Ollama as a sidecar, the application maintains its "local-first" privacy and performance even in the cloud, with zero external API latency and full data sovereignty.

---

## 🔧 Configuration

### Backend Configuration
Edit `backend/app/config.py`:
```python
# Model settings
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # or any sentence-transformers model
LLM_MODEL = "gemma4:4b"  # Google Gemma 4 with 4B parameters

# Vector DB settings
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

# API settings
MAX_UPLOAD_SIZE_MB = 100
OLLAMA_BASE_URL = "http://localhost:11434"
```

### Frontend Configuration
Edit `frontend/lib/api-client.ts`:
```typescript
// API endpoint configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Request timeout (ms)
const REQUEST_TIMEOUT = 30000;
```

---

## 🚀 Performance Tips

### Optimize Embeddings
Use smaller models for faster processing:
```python
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # Smaller, faster
# Instead of: "all-mpnet-base-v2"      # Larger, more accurate
```

### Batch Processing
When uploading multiple documents, use the batch API:
```bash
# Process multiple files efficiently
POST /api/documents/batch-upload
```

### Vector DB Optimization
- Regularly clean old vectors: `POST /api/admin/cleanup`
- Monitor DB size: Check `data/vectordb/`

---

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Fast setup guide
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Detailed project overview
- **[OFFLINE_MODE.md](OFFLINE_MODE.md)** - Offline operation guide
- **[docs/PHASE_4_SUMMARY.md](docs/PHASE_4_SUMMARY.md)** - Complete feature summary
- **[docs/DOCKER_SETUP.md](docs/DOCKER_SETUP.md)** - Docker deployment guide

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Python version (needs 3.11+)
python --version

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check if port 8000 is in use
netstat -ano | findstr :8000
```

### Frontend Shows Connection Error
```bash
# Clear Next.js cache
rm -rf frontend/.next

# Reinstall dependencies
cd frontend && npm install

# Verify backend is running: http://localhost:8000/docs
```

### Ollama Not Connecting
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Pull a model if needed
ollama pull llama3.2

# Restart Ollama service
```

### High Memory Usage
- Use smaller embedding model: `all-MiniLM-L6-v2`
- Reduce chunk size: `CHUNK_SIZE = 256`
- Clear cache: `DELETE /api/admin/cache`

---

## 🤝 Contributing

We welcome contributions! Help us build the future of equitable AI learning.

### Getting Started
1. Fork the repository on GitHub
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/GuruCortex.git`
3. Create feature branch: `git checkout -b feature/your-feature`
4. Make changes and test locally
5. Commit: `git commit -m 'Add your feature'`
6. Push: `git push origin feature/your-feature`
7. Open Pull Request with description

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Test in both native and Docker environments

### Areas for Contribution
- 🐛 Bug fixes and improvements
- 📚 Documentation enhancement
- 🎨 UI/UX improvements
- 🚀 Performance optimization
- 🌐 Localization support
- 🧪 Test coverage
- 🔌 Plugin/extension development

---

## 📋 Roadmap

### Completed ✅
- Phase 1: Core RAG Foundation
- Phase 2: Multimodal Capabilities
- Phase 3: Conversation Management
- Phase 4: Assessment & Learning Analytics

### Future Plans 🎯
- Plugin system for custom features
- Mobile app (iOS/Android)
- Advanced visualization tools
- Collaborative learning features
- API for third-party integrations
- Advanced NLP features (entity extraction, sentiment)
- Support for more file formats

---

## 📊 Project Statistics

- **Backend:** ~2000+ lines of Python/FastAPI code
- **Frontend:** ~3000+ lines of React/TypeScript code
- **Documentation:** 10+ comprehensive guides
- **Supported Models:** 50+ via Ollama
- **File Types:** 6+ formats supported
- **API Endpoints:** 20+ RESTful endpoints

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Free for personal and commercial use
- ✅ You can modify and distribute
- ❌ No liability or warranty provided
- ✅ Must include license in distributions

---

## 🙏 Acknowledgments

### Built For
- **AMD Slingshot Hackathon** - The organizing event
- **Open Source Community** - For amazing libraries and tools

### Key Technologies
- [FastAPI](https://fastapi.tiangolo.com/) - Modern API framework
- [Next.js](https://nextjs.org/) - React framework
- [ChromaDB](https://www.trychroma.com/) - Vector database
- [Ollama](https://ollama.ai/) - Local LLM platform
- [LangChain](https://python.langchain.com/) - LLM orchestration
- [sentence-transformers](https://www.sbert.net/) - Embeddings

### Contributors
- **Team ZenForge** - Project team
- **Hackathon Organizers** - AMD & event sponsors

---

## 💬 Support & Contact

### Getting Help
1. **Check Documentation:** See [docs/](docs/) folder first
2. **Search Issues:** Look for similar problems on GitHub Issues
3. **Create New Issue:** Describe the problem with steps to reproduce
4. **Join Community:** Discussions and Q&A in GitHub Discussions

### Report a Bug
Open an issue with:
- OS and version
- Python/Node.js version
- Steps to reproduce
- Expected vs actual behavior
- Error logs

### Feature Requests
Describe the feature and why it would be useful

---

## 🎉 Conclusion

GuruCortex represents a new paradigm in AI-assisted learning—combining the power of large language models with the privacy-first approach that users deserve. Whether you're a student, educator, researcher, or lifelong learner, GuruCortex provides the tools to learn smarter, faster, and more safely.

**Join us in building the future of privacy-conscious AI learning.**

---

<div align="center">

**GuruCortex | Built with ❤️ by Team ZenForge**

⭐ If you find this project useful, please consider giving it a star! ⭐

</div>
