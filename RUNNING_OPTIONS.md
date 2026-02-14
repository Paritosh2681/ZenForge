# 🚀 RUNNING GURU-AGENT - Quick Start Guide

## Current Status

✅ **Phase 1**: Complete (RAG with ChromaDB)
✅ **Phase 2**: Complete (Multimodal code ready)
⚠️ **Deployment**: Needs Docker or local Phase 2 install

---

## Option 1: Run Demo Now (Fastest) 🏃

**What works**: Full UI, basic RAG, chat, diagrams
**What's mocked**: Phase 2 multimodal (attention, voice, TTS)

```bash
# Terminal 1: Start Demo Backend
cd backend/app
../venv/bin/python main_demo.py

# Terminal 2: Start Frontend
cd frontend
npm run dev

# Access: http://localhost:3000
```

**Time**: 30 seconds

---

## Option 2: Full System with Docker 🐳 (Recommended)

**What works**: Everything including Phase 2!
**Requirements**: Docker Desktop

### Step 1: Install Docker
Download from: https://docker.com/get-docker/
**Time**: 5 minutes

### Step 2: Run One Command
```bash
# Windows
scripts\docker-start.bat

# Linux/Mac
./scripts/docker-start.sh
```

**First Build**: ~20 minutes (downloads all models)
**Next Runs**: ~2 minutes

**You get**:
- ✅ Full RAG with ChromaDB
- ✅ MediaPipe attention tracking
- ✅ Whisper voice input (12+ languages)
- ✅ Coqui TTS audio output
- ✅ All features working!

---

## Option 3: Install Phase 2 Locally (Advanced) 💻

**Requirements**: Visual Studio Build Tools (Windows)

### Step 1: Install Build Tools
Download: https://visualstudio.microsoft.com/downloads/
Select: "Desktop development with C++"
**Time**: 10 minutes

### Step 2: Install Phase 2 Dependencies
```bash
cd backend
venv/Scripts/activate
pip install -r requirements-phase2.txt
```
**Time**: 15-20 minutes (large models)

### Step 3: Run Full Backend
```bash
cd backend
venv/Scripts/activate
python -m app.main  # Full version with Phase 2
```

**Downloads on first run**:
- Whisper base model: ~150MB
- Coqui TTS model: ~2GB
- MediaPipe models: Included

---

## What I Recommend 🎯

### For Immediate Demo
**Use Option 1** (Demo mode)
- Already installed
- Works right now
- Shows architecture
- Tests UI/UX

### For Full Experience
**Use Option 2** (Docker)
- Easiest setup
- Production-ready
- All features work
- No dependency hell

### For Development
**Use Option 3** (Local install)
- Native performance
- Easy debugging
- Direct code access

---

## Quick Comparison

| Feature | Demo | Docker | Local |
|---------|------|--------|-------|
| **Setup Time** | 30s | 20min first | 30min |
| **RAG** | Mock | ✅ Full | ✅ Full |
| **Attention** | Mock | ✅ Real | ✅ Real |
| **Voice** | N/A | ✅ 12+ langs | ✅ 12+ langs |
| **TTS** | N/A | ✅ Multi | ✅ Multi |
| **Requirements** | None | Docker | Build Tools |

---

## Commands Reference

### Demo Mode
```bash
# Backend
cd backend/app && ../venv/bin/python main_demo.py

# Frontend
cd frontend && npm run dev

# Access
http://localhost:3000
```

### Docker Mode
```bash
# Start
docker-compose up --build

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

### Local Full Mode
```bash
# Backend
cd backend
venv/Scripts/activate
python -m app.main

# Frontend
cd frontend
npm run dev
```

---

## Phase 2 Features (Need Docker or Local Full)

### Attention Monitoring 👁️
- Real-time blink rate tracking
- Fatigue detection
- Gaze direction analysis
- Automatic break reminders

### Voice Input 🎤
- Speak in 12+ languages
- Auto language detection
- Translation to English
- High accuracy transcription

### Audio Output 🔊
- Natural-sounding voices
- 16+ languages
- Voice cloning
- Audio file download

---

## Current Demo Limitations

**What Demo DOES have**:
- ✅ Full Next.js UI
- ✅ Chat interface
- ✅ Document upload
- ✅ Mermaid diagrams
- ✅ Ollama/Mistral LLM
- ✅ API architecture

**What Demo DOESN'T have**:
- ❌ Real document parsing
- ❌ ChromaDB vector search
- ❌ Attention tracking
- ❌ Voice input
- ❌ TTS output

---

## Which Should You Choose?

### Choose Demo if:
- Want to see it working NOW
- Testing UI/UX design
- Showing general concept
- Don't need full features yet

### Choose Docker if:
- Want ALL features working
- Have 30 min for first setup
- Want production environment
- Need full Phase 2 capabilities

### Choose Local if:
- Doing active development
- Need to debug code
- Want native performance
- Already have build tools

---

## Let's Run It! 🎬

**I can start the demo right now for you!**

Just tell me:
1. **"demo"** - I'll start demo mode instantly
2. **"docker"** - I'll guide you through Docker setup
3. **"local"** - I'll help install Phase 2 locally

**What would you like to do?**

---

**Note**: Demo is already installed and working. Docker/Local need additional setup but give you full Phase 2 features.
