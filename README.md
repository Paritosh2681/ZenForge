# ZenForge - GuruCortex (Project Cortex)

**A 100% Local, Privacy-First AI Learning Companion.**

ZenForge (GuruCortex) is a full-stack, local-first RAG (Retrieval-Augmented Generation) application built for the AMD Slingshot Hackathon. It provides a complete AI learning companion experience with document processing, multimodal features, and generative UI—all running securely on your local device without any cloud dependencies.

---

## 🌟 Key Features

*   **100% Local & Private:** Zero cloud APIs, no telemetry, all processing is on-device.
*   **Local RAG Pipeline:** Upload and query PDF, Word, PowerPoint, and Text files.
*   **Vector Search Engine:** Embeddings generated using `sentence-transformers` and stored in a local ChromaDB.
*   **Local LLM Inference:** Powered by Ollama (supports Mistral-7B, Llama-3.2, etc.).
*   **Generative UI:** Automatically generates interactive Mermaid diagrams based on processes or workflows in your documents.
*   **Multimodal Capabilities:** Ready for attention tracking, voice input (Whisper), and local TTS (Text-to-Speech).
*   **Advanced Analytics & Study Planner:** Spaced repetition, gamification, UI focus modes, and more.

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Mermaid.js |
| **Backend** | Python 3.11+, FastAPI, Pydantic, aiofiles |
| **RAG & ML** | ChromaDB, sentence-transformers, LangChain, PyPDF, python-docx |
| **LLM Engine** | Ollama |
| **Deployment** | Docker, Docker Compose |

## 🚀 Getting Started

There are multiple ways to run ZenForge. For the easiest setup, ensure you have **Ollama** installed locally (with a model pulled, e.g., `ollama run llama3.2`).

### 1. Simple Full-System Quickstart (Windows)
To quickly set up and run both the frontend and backend on Windows, use the provided batch script:
```bash
./start_complete_system.bat
```
*This script will ensure dependencies are met and will spawn both the backend (port 8000) and frontend (port 3000).*

### 2. Docker Deployment (Recommended)
You can run the entire system via Docker Compose:
```bash
# Start the full stack (requires Docker Desktop)
docker-compose -f docker-compose.full.yml up -d
```

### 3. Native Manual Setup
#### Backend
1. Navigate to `backend/`
2. Create and activate a virtual environment: `python -m venv venv` and `venv\Scripts\activate`
3. Install dependencies: `pip install -r requirements.txt` (Run `pip install tiktoken` if missing)
4. Run the server: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`

#### Frontend
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

Access the UI at **http://localhost:3000**.

## 📁 Repository Structure

*   `backend/`: FastAPI application, document processing, and vector database logic.
*   `frontend/`: Next.js React application, dashboard UI, and generative components.
*   `data/`: Local storage for ChromaDB instances, uploads, and SQLite metadata.
*   `docs/`: Detailed project documentation, specifications, and offline-mode setups.
*   `scripts/` & Root `.bat`: Various startup and convenience scripts.

## 🛡️ Privacy & Security
**No data leaves your machine.** Documents are chunked, embedded, and queried entirely over `localhost`. Vector representations remain in `./data` and interact only with your locally running Ollama instance.

## 🏆 Hackathon
Built by the **ZenForge** team for the **AMD Slingshot Hackathon**, prioritizing privacy-conscious learners who want the power of AI without sacrificing their data.
