# 🌐 ZenForge Offline Mode Configuration

## 📁 **LOCAL DATA STORAGE**

All data is stored locally in the `/data` directory:

```
ZenForge/
├── data/
│   ├── uploads/          # Uploaded documents (PDF, DOCX, PPTX)
│   ├── vectordb/         # ChromaDB vector embeddings 
│   ├── conversations.db  # SQLite conversation history
│   ├── cache/           # Cached models and temp files
│   └── analytics/       # Learning progress data
```

## 🔧 **OFFLINE COMPONENTS**

### ✅ **Fully Offline (No Internet Required)**

1. **Document Processing**
   - PDF extraction (PyPDF2, pypdf)
   - DOCX processing (python-docx)
   - PPTX processing (python-pptx)
   - Text chunking and preprocessing

2. **Vector Database**
   - ChromaDB (local vector storage)
   - Sentence-transformers embeddings (cached locally)
   - Similarity search and RAG retrieval

3. **Multimodal Features**
   - Camera access and OpenCV processing
   - Face detection and attention tracking
   - Image analysis for focus monitoring

4. **Audio/Voice**
   - Browser Speech Recognition API
   - Browser Speech Synthesis API
   - No external API dependencies

5. **Code Execution**
   - Local Python interpreter
   - Sandboxed execution environment
   - No cloud compute required

6. **UI/Frontend**
   - Next.js static generation
   - Local asset serving
   - No CDN dependencies

### ⚠️ **Requires Local Setup**

7. **AI Chat (Ollama)**
   - Local LLM server on localhost:11434
   - Models: llama3.2, mistral:7b, qwen2.5
   - One-time download, then fully offline

## 🚀 **OFFLINE SETUP MODES**

### **Mode 1: Quick Setup (Windows)**
```bash
# Run automated setup script
.\Setup-Offline-AI.bat
```

### **Mode 2: Python Setup (Cross-platform)**
```bash
# Run Python setup script
python setup_offline.py
```

### **Mode 3: Manual Setup**
```bash
# 1. Install Ollama
winget install Ollama.Ollama

# 2. Download model
ollama pull llama3.2:latest

# 3. Start services
.\Start-GuruCortex.bat
```

## 🎯 **OFFLINE VERIFICATION**

### **Test Complete Offline Mode:**
```bash
# 1. Disconnect from internet
# 2. Launch ZenForge
.\Start-GuruCortex.bat

# 3. Verify features work:
# ✅ Upload/process documents
# ✅ Search documents with AI
# ✅ Camera attention monitoring
# ✅ Voice input/output
# ✅ Code execution
# ✅ Learning analytics
```

## 📊 **STORAGE REQUIREMENTS**

| Component | Size | Required |
|-----------|------|----------|
| ZenForge Application | ~200MB | ✅ Yes |
| Embedding Models | ~500MB | ✅ Yes |
| Ollama LLM (llama3.2) | ~3GB | ⚠️ For AI chat |
| Ollama LLM (mistral:7b) | ~3.8GB | ⚠️ Alternative |
| Ollama LLM (qwen2.5:3b) | ~1.5GB | ⚠️ Lightweight |
| **Total (with AI chat)** | **~4GB** | **Complete offline** |

## 🔒 **PRIVACY GUARANTEES**

### **Zero External Dependencies:**
- ❌ No OpenAI API calls
- ❌ No Google/Azure cloud services  
- ❌ No analytics tracking
- ❌ No telemetry data
- ❌ No internet requirements (after setup)

### **100% Local Processing:**
- ✅ All document analysis local
- ✅ All AI processing local
- ✅ All data storage local
- ✅ All computation local
- ✅ Complete air-gap capability

## ⚡ **PERFORMANCE BENEFITS**

### **Offline Advantages:**
- 🚀 **Instant Response**: No API latency
- 💾 **No Data Limits**: Unlimited local processing
- 🔒 **Complete Privacy**: No data ever leaves your machine
- 💰 **Zero Costs**: No subscription fees
- 🌐 **Works Anywhere**: No internet dependency

### **System Requirements:**
- **RAM**: 8GB recommended (4GB minimum)
- **Storage**: 5GB free space
- **CPU**: Any modern processor
- **GPU**: Not required (CPU-only operation)

## 🎉 **OFFLINE FEATURE MATRIX**

| Feature | Offline Status | Notes |
|---------|---------------|-------|
| Document Upload | ✅ Fully Offline | Local file processing |
| PDF Processing | ✅ Fully Offline | PyPDF2 + pypdf libraries |
| Vector Search | ✅ Fully Offline | ChromaDB local database |
| AI Chat | ✅ Offline (with Ollama) | Requires local model download |
| Focus Monitoring | ✅ Fully Offline | OpenCV computer vision |
| Voice Input | ✅ Fully Offline | Browser Speech Recognition |
| Text-to-Speech | ✅ Fully Offline | Browser Speech Synthesis |
| Code Execution | ✅ Fully Offline | Local Python interpreter |
| Learning Analytics | ✅ Fully Offline | Local SQLite database |
| Progress Tracking | ✅ Fully Offline | Local data storage |
| Quiz Generation | ✅ Offline (with Ollama) | Local LLM processing |
| Podcast Generation | ✅ Offline (with Ollama) | Local text-to-speech |

**Result: 100% offline AI learning platform with complete privacy! 🎉**