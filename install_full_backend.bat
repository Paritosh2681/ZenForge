@echo off
title Installing ZenForge Full Backend Dependencies
color 0B

@echo off
title Installing ZenForge Full Backend Dependencies
color 0B

echo.
echo ======================================
echo   ZenForge Full Backend Setup
echo ======================================
echo.

echo Installing full backend dependencies with MSYS2 compatibility...
echo This will enable attention monitoring and RAG features.
echo.

echo [1/6] Installing basic dependencies...
python -m pip install fastapi uvicorn python-multipart pydantic-settings httpx python-dotenv aiofiles aiosqlite --user --break-system-packages

echo [2/6] Installing document processing...
python -m pip install PyPDF2 pypdf python-pptx python-docx --user --break-system-packages

echo [3/6] Installing AI/ML dependencies...
python -m pip install chromadb sentence-transformers --user --break-system-packages

echo [4/6] Installing multimodal dependencies...
python -m pip install opencv-python-headless numpy mediapipe --user --break-system-packages

echo [5/6] Installing missing dependencies...
python -m pip install tiktoken openai python-jose bcrypt passlib --user --break-system-packages

echo [6/6] Installing audio/speech dependencies...
python -m pip install speechrecognition gtts pygame sounddevice --user --break-system-packages

echo.
echo 🧪 Testing key installations...
python -c "import chromadb; print('✅ chromadb OK')" 2>nul || echo "❌ chromadb failed"
python -c "import tiktoken; print('✅ tiktoken OK')" 2>nul || echo "❌ tiktoken failed"
python -c "import sentence_transformers; print('✅ sentence_transformers OK')" 2>nul || echo "❌ sentence_transformers failed"

echo.
echo ======================================
echo   Installation Complete!
echo ======================================
echo.
echo Full backend dependencies are now installed.
echo You can now run the full backend with all features:
echo.
echo   - Attention monitoring
echo   - Document processing (RAG)  
echo   - Multimodal features
echo   - Vector store (ChromaDB)
echo.
echo Next steps:
echo   1. Run: Simple-Start.bat (recommended)
echo   2. Or start manually with backend + frontend
echo.
pause