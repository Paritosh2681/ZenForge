# 🚀 GuruCortex - AI Learning Companion

> **A 100% Local, Privacy-First AI Learning Companion** — Built by Team ZenForge for the AMD Slingshot Hackathon

[![GitHub](https://img.shields.io/badge/GitHub-GuruCortex-blue?logo=github)](https://github.com/Paritosh2681/ZenForge)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)](https://www.docker.com/)

---

## 📋 Overview

**GuruCortex** is a full-stack, local-first **Retrieval-Augmented Generation (RAG)** application that transforms how you learn from documents. It combines a modern Next.js frontend with a powerful FastAPI backend to deliver an intelligent, privacy-conscious learning experience—all running securely on your local device.

### Why GuruCortex?

- **🔒 Complete Privacy:** 100% local processing, zero cloud APIs, no data telemetry
- **⚡ Instant Setup:** Single-command deployment with Docker or native scripts
- **🎓 Smart Learning:** AI-powered document analysis, quiz generation, and spaced repetition
- **🎨 Modern Interface:** Beautiful, responsive UI built with Next.js and Tailwind CSS
- **🔌 Offline-Ready:** Works completely offline after initial model download

---

## 🌟 Key Features

### 📚 Document Intelligence
- **Multi-Format Support:** PDF, DOCX, PPTX, TXT
- **Automatic Chunking:** Intelligent text segmentation for optimal retrieval
- **Semantic Search:** Find relevant content using AI-powered similarity matching
- **Citation Source Tracking:** Know exactly where answers come from

### 🤖 AI-Powered Learning
- **Local LLM Integration:** Run Mistral-7B, Llama-3.2, or other models via Ollama
- **Context-Aware Responses:** RAG engine retrieves relevant document excerpts for accurate answers
- **Generative Diagrams:** Auto-generates Mermaid diagrams from document content
- **Multi-Turn Conversations:** Maintain context across multiple queries

### 📊 Advanced Assessment
- **Intelligent Quiz Generation:** Auto-generate MCQ, True/False, and short-answer questions
- **Spaced Repetition (SM-2):** Scientifically-proven algorithm for long-term retention
- **Mastery Tracking:** Monitor progress from Novice to Advanced levels
- **Learning Analytics:** Detailed insights on study patterns and performance

### 🎯 Multimodal Capabilities
- **Attention Tracking:** Real-time focus monitoring via webcam (OpenCV, MediaPipe)
- **Voice Input:** Browser-based speech recognition (no external APIs)
- **Text-to-Speech:** Local audio output with natural voice synthesis
- **Image Processing:** Upload and analyze images with local models

### 💾 Data Persistence
- **Conversation History:** SQLite-backed persistent conversations
- **Vector Embeddings:** ChromaDB local vector database
- **Learning Progress:** Tracked study sessions and quiz results
- **Customizable Storage:** All data in `./data` directory for easy backup

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | Modern web UI with SSR |
| | Tailwind CSS, Framer Motion | Styling and animations |
| | Mermaid.js, react-markdown | Diagrams and content rendering |
| | Axios | HTTP API client |
| **Backend** | FastAPI, Uvicorn | High-performance REST API |
| | Python 3.11+ | Core runtime |
| | Pydantic | Data validation |
| **RAG/ML** | ChromaDB | Vector database |
| | sentence-transformers | Embeddings generation |
| | LangChain | RAG orchestration |
| | PyPDF2, python-docx, python-pptx | Document parsing |
| **LLM** | Ollama | Local inference engine |
| | Mistral-7B, Llama-3.2 | Large language models |
| **Storage** | SQLite | Metadata & conversations |
| | Local filesystem | Document & vector storage |
| **DevOps** | Docker, Docker Compose | Containerization & orchestration |

---

## 🚀 Quick Start

### Prerequisites

- **Windows, macOS, or Linux**
- **Docker & Docker Compose** (recommended) OR **Python 3.11+** & **Node.js 18+**
- **Ollama** installed with a model pulled (e.g., `ollama pull llama3.2`)

### Option 1: One-Command Setup (Windows)

```bash
# Clone and navigate to project
git clone https://github.com/Paritosh2681/ZenForge.git
cd ZenForge

# Run complete system startup
.\start_complete_system.bat
```

Access the application at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Option 2: Docker Deployment (Recommended)

```bash
# Start full stack with Docker
docker-compose -f docker-compose.full.yml up -d

# View logs
docker-compose logs -f

# Access the same URLs as above
```

**Stop services:**
```bash
docker-compose down
```

Then open http://localhost:3000 in your browser.

### #Option 3: Manual Native Setup

#### Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate environment (Windows)
venv\Scripts\activate
# Or on macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup (in a new terminal)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Then open http://localhost:3000 in your browser.

---

## 📁 Project Structure

```
gurucortex/
├── 📄 README.md                    # This file
├── 📄 PROJECT_SUMMARY.md           # Detailed project overview
├── 📄 QUICKSTART.md                # Quick reference guide
├── 📄 OFFLINE_MODE.md              # Offline functionality guide
│
├── backend/                        # Python FastAPI Application
│   ├── app/
│   │   ├── main.py                 # FastAPI app & RAG engine
│   │   ├── config.py               # Configuration management
│   │   ├── models/
│   │   │   └── schemas.py          # Pydantic data models
│   │   ├── services/
│   │   │   ├── document_processor.py   # PDF/DOCX/PPTX parsing
│   │   │   ├── vector_store.py        # ChromaDB integration
│   │   │   ├── llm_client.py          # Ollama communication
│   │   │   └── rag_engine.py          # RAG orchestration
│   │   └── routers/
│   │       ├── documents.py        # Upload endpoints
│   │       └── chat.py             # Query endpoints
│   ├── requirements.txt            # Python dependencies
│   ├── requirements-minimal.txt    # Minimal dependencies
│   ├── Dockerfile                  # Container image
│   └── test_phase*.py              # Test scripts
│
├── frontend/                       # Next.js React Application
│   ├── app/
│   │   ├── page.tsx               # Dashboard
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Global styles
│   │   └── dashboard/             # Dashboard pages
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
ZenForge works completely offline after initial setup:
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

GuruCortexfline Mode Setup

ZenForge includes dedicated offline setup scripts. All components can run without internet:

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
2. Launch ZenForge
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
docker build -t zenforge-backend ./backend

# Build just frontend
docker build -t zenforge-frontend ./frontend

# Run containers manually
docker run -p 8000:8000 zenforge-backend
docker run -p 3000:3000 zenforge-frontend
```

---

## 🔧 Configuration

### Backend Configuration
Edit `backend/app/config.py`:
```python
# Model settings
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # or any sentence-transformers model
LLM_MODEL = "mistral:7b"

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

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/zenforge.git`
3. Create a branch: `git checkout -b feature/amazing-feature`
4. Make your changes and commit: `git commit -m 'Add amazing feature'`
5. Push to your fork: `git push origin feature/amazing-feature`
6. Open a Pull Request

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
