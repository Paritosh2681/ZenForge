# Phase 1 Technical Specification

## Guru-Agent: Local RAG Foundation

**Completion Date:** February 2026
**Phase Status:** COMPLETE ✅

---

## Goals Achieved

Phase 1 establishes the foundational architecture for a local-first AI learning companion with the following core capabilities:

### 1. Document Ingestion Pipeline ✅

**Supported Formats:**
- PDF (via PyPDF2)
- PowerPoint (PPTX/PPT via python-pptx)
- Word Documents (DOCX/DOC via python-docx)

**Processing Flow:**
1. File upload via multipart form data
2. Text extraction with page/slide metadata
3. Intelligent chunking (1000 chars, 200 overlap)
4. Vector embedding generation (all-MiniLM-L6-v2)
5. Storage in ChromaDB with metadata

**Chunking Strategy:**
- RecursiveCharacterTextSplitter with semantic boundaries
- Preserves context across chunks
- Metadata includes document_id, filename, chunk_index, page_number

### 2. Vector Store Integration ✅

**Technology:** ChromaDB (local persistence)

**Features:**
- Local embedding model (sentence-transformers)
- Persistent storage in `data/vectordb/`
- L2 distance similarity search
- Configurable similarity threshold (0.7 default)
- Top-K retrieval (4 chunks default)

**Advantages:**
- Zero external API calls
- Fast local queries (<100ms typical)
- Privacy-preserving
- No internet required

### 3. Local LLM Inference ✅

**Technology:** Ollama (Mistral-7B)

**Integration Points:**
- REST API communication (httpx async client)
- System prompt engineering for educational context
- Temperature control (0.7 for balanced responses)
- Token limit management (2000 max)

**Prompt Structure:**
```
System: Educational assistant persona + diagram generation instructions
User: Context from RAG + Student question
```

### 4. RAG Engine Orchestration ✅

**Pipeline:**
```
Query → Embed → Retrieve → Context Assembly → LLM → Response
```

**Components:**
- `VectorStore`: Handles embedding and retrieval
- `OllamaClient`: Manages LLM communication
- `RAGEngine`: Orchestrates the full pipeline

**Features:**
- Conversation ID tracking
- Source citation with relevance scores
- Fallback handling (no context available)
- Health monitoring

### 5. Generative UI (Mermaid.js) ✅

**Automatic Diagram Generation:**
- LLM trained to output Mermaid syntax
- Extraction via regex parsing
- Client-side rendering with mermaid library
- Error handling and fallback

**Supported Diagram Types:**
- Flowcharts (process explanations)
- Graphs (relationships)
- Class diagrams (structures)
- Sequence diagrams (interactions)

**Trigger Logic:**
- LLM decides when diagrams add value
- User can disable via API parameter
- Rendered separately from text response

### 6. Next.js Frontend ✅

**Architecture:**
- App Router (Next.js 14+)
- TypeScript for type safety
- Tailwind CSS for styling
- Framer Motion for animations

**Components:**
```
Dashboard (page.tsx)
├── DocumentUploader
│   └── File validation, upload, progress
├── ChatInterface
│   ├── Message history
│   ├── Source citations
│   └── MermaidRenderer
└── Health Status
    ├── Ollama connectivity
    └── Document count
```

**User Experience:**
- Real-time upload feedback
- Animated message transitions
- Collapsible uploader
- Source truncation for readability
- Loading states and error handling

### 7. API Design ✅

**RESTful Endpoints:**

**Documents:**
- `POST /documents/upload` - Multipart file upload
- `GET /documents/count` - Indexed chunk count

**Chat:**
- `POST /chat/query` - RAG query with streaming option
- `GET /chat/health` - System health check

**Response Format:**
```json
{
  "response": "...",
  "sources": [{"content": "...", "similarity_score": 0.85}],
  "mermaid_diagram": "flowchart TD\n...",
  "conversation_id": "uuid",
  "timestamp": "2026-02-13T..."
}
```

---

## Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 + TypeScript | Modern React framework |
| UI | Tailwind CSS + Framer Motion | Styling and animations |
| Backend | FastAPI + Python 3.10 | High-performance API |
| LLM | Ollama (Mistral-7B) | Local inference |
| Vector DB | ChromaDB | Embedding storage |
| Embeddings | sentence-transformers | Local text encoding |
| Diagrams | Mermaid.js | Generative visualizations |
| Document Processing | PyPDF2, python-pptx, python-docx | Multi-format support |

---

## Performance Benchmarks

**Document Processing:**
- 10-page PDF: ~5 seconds
- 20-slide PowerPoint: ~3 seconds
- First-time embedding model download: ~30 seconds

**Query Response:**
- Retrieval: ~50-100ms
- LLM inference: 2-6 seconds (depends on answer length)
- Total: ~3-8 seconds typical

**System Requirements:**
- RAM: 8GB minimum (16GB recommended)
- Storage: 5GB for models and dependencies
- CPU: Multi-core recommended for Ollama

---

## Security & Privacy

**Data Flow:**
- All processing happens locally (no external APIs)
- Documents stored in `data/uploads/` (gitignored)
- Vector embeddings in `data/vectordb/` (gitignored)
- No telemetry or analytics

**Isolation:**
- ChromaDB runs in-process (no network exposure)
- Ollama accessible only on localhost:11434
- CORS restricted to frontend origin

---

## Testing Strategy

**Manual Testing Checklist:**
- [x] Upload PDF and verify chunking
- [x] Upload PowerPoint and verify processing
- [x] Query with no documents (fallback message)
- [x] Query with documents (RAG response)
- [x] Diagram generation for process questions
- [x] Source citation display
- [x] Health check endpoint
- [x] Ollama offline handling
- [x] Large file upload (>10MB)
- [x] Invalid file type rejection

**Future Testing:**
- Unit tests for document processor
- Integration tests for RAG pipeline
- E2E tests for frontend flows

---

## Known Limitations (Phase 1)

1. **No conversation memory** - Each query is stateless
2. **Single language** - English only (multilingual in Phase 2)
3. **Text-only input** - No voice or vision (Phase 2)
4. **No assessment features** - Hints/rubrics in Phase 3
5. **No progress tracking** - Spaced repetition in Phase 4

---

## Deployment

**Development:**
- Backend: `python -m app.main` (port 8000)
- Frontend: `npm run dev` (port 3000)
- Ollama: `ollama serve` (port 11434)

**Production (Future):**
- Docker Compose for bundled deployment
- Systemd services for backend and Ollama
- Nginx reverse proxy (optional)

---

## API Documentation

Interactive Swagger docs available at:
`http://localhost:8000/docs`

Includes:
- Request/response schemas
- Try-it-out functionality
- Model definitions
- Authentication (none required for Phase 1)

---

## Code Quality

**Backend:**
- Type hints throughout
- Pydantic for validation
- Async/await for I/O operations
- Error handling with HTTPException

**Frontend:**
- TypeScript strict mode
- Interface definitions for API types
- Component prop validation
- CSS modules avoided (Tailwind utility classes)

---

## Phase 1 Success Criteria ✅

- [x] User can upload study materials locally
- [x] Documents are chunked and embedded
- [x] User can ask questions about uploaded content
- [x] AI responds with source-grounded answers
- [x] Diagrams auto-generate for process-related queries
- [x] Entire system runs without internet (post-install)
- [x] Frontend provides clear feedback on all actions
- [x] Health monitoring shows system status

---

## Transition to Phase 2

**Next Goals:**
1. Integrate MediaPipe for attention tracking
2. Add Whisper for local speech-to-text
3. Implement local TTS for multilingual output
4. Design emotion detection from webcam feed

**Prerequisites:**
- Phase 1 fully functional and tested
- User approval to proceed
- No breaking changes to Phase 1 architecture

---

## Maintenance

**Dependencies:**
- Monthly updates for security patches
- Quarterly review of LLM model options
- Monitor Ollama releases for performance improvements

**Data Management:**
- `data/` directory can grow large (user responsibility)
- Vector DB can be reset via API endpoint
- Uploaded files can be manually deleted

---

## Conclusion

Phase 1 delivers a fully functional, privacy-preserving RAG system with generative UI. The foundation is modular and extensible, ready for multimodal and assessment features in subsequent phases.

**Status:** READY FOR PHASE 2 PLANNING ✅
