@echo off
title GuruCortex - AI Learning Companion
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║              GuruCortex AI Learning Companion                 ║
echo  ║                🏠 100%% Local  ^|  🔒 100%% Private           ║
echo  ║                    Starting Full System...                   ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check requirements
echo 🔍 Checking requirements...

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found - Install from: https://python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python found

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found - Install from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if running in offline mode
echo.
echo 🔧 Choose deployment mode:
echo [1] WSL Backend (current setup)
echo [2] Windows Native Backend (recommended for offline)
echo [3] Offline Setup (install Ollama + models)
echo.
set /p MODE="Enter choice (1-3): "

if "%MODE%"=="3" (
    echo.
    echo 🚀 Running offline setup...
    if exist "Setup-Offline-AI.bat" (
        call "Setup-Offline-AI.bat"
    ) else (
        echo ❌ Setup-Offline-AI.bat not found. Creating now...
        echo Please run Setup-Offline-AI.bat first to configure offline mode.
        pause
    )
    exit /b 0
)

if "%MODE%"=="2" (
    echo.
    echo 📦 Setting up Windows native backend...
    
    REM Setup backend environment on Windows
    cd backend
    
    REM Remove any existing broken venv
    if exist .venv (
        echo Removing existing virtual environment...
        rmdir /S /Q .venv
    )
    
    echo Creating Python virtual environment...
    python -m venv .venv
    
    echo Installing backend dependencies...
    .venv\Scripts\python.exe -m pip install --upgrade pip
    .venv\Scripts\python.exe -m pip install -r requirements.txt
    
    cd ..
    
    REM Cache embedding models for offline document processing
    echo 🤖 Checking embedding model cache...
    backend\.venv\Scripts\python.exe cache_embedding_model.py
    if %errorlevel% neq 0 (
        echo ⚠️ Embedding model caching failed - document upload may require internet
    )
    
    REM Set frontend to use localhost
    echo 🌐 Using backend host: localhost:8001
    > frontend\.env.local echo NEXT_PUBLIC_API_URL=http://localhost:8001
    
    REM Setup frontend environment
    echo 📦 Setting up frontend environment...
    cd frontend
    if not exist node_modules (
        echo Installing frontend dependencies...
        npm install
    )
    cd ..
    
    echo.
    echo 🚀 Starting GuruCortex services...
    
    REM Start Ollama (optional)
    echo [1/4] Starting Ollama AI service (if available)...
    where ollama >nul 2>&1
    if %errorlevel% equ 0 (
        start /MIN "Ollama" cmd /c "ollama serve"
        echo ✅ Ollama started
    ) else (
        echo ⚠️ Ollama not found - AI chat will be limited
        echo   Install from: https://ollama.ai/download
    )
    timeout /t 3 /nobreak >nul
    
    REM Start Backend on Windows
    echo [2/4] Starting Backend API server (Windows native)...
    cd backend
    start "GuruCortex Backend - Keep Open" cmd /k ".venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001"
    cd ..
    timeout /t 8 /nobreak >nul
    
    REM Start Frontend
    echo [3/4] Starting Frontend web server...
    cd frontend
    start "GuruCortex Frontend - Keep Open" cmd /k "npm run dev"
    cd ..
    timeout /t 12 /nobreak >nul
    
    REM Open application
    echo [4/4] Opening GuruCortex application...
    timeout /t 5 /nobreak >nul
    
    echo.
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║                    🎉 GURUCORTEX READY! 🎉                   ║
    echo ║                   Windows Native Mode                        ║
    echo ║                                                              ║
    echo ║  🌐 Dashboard: http://localhost:3000/dashboard               ║
    echo ║  🔧 API Docs:  http://localhost:8001/docs                   ║
    echo ║                                                              ║
    echo ║  💡 Two service windows opened:                              ║
    echo ║     - Backend (Python FastAPI - Windows native)             ║
    echo ║     - Frontend (Next.js)                                    ║
    echo ║                                                              ║
    echo ║  🛑 Close both service windows to stop GuruCortex           ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    
    set BACKEND_URL=localhost:8001
    
) else (
    echo.
    echo 📦 Setting up backend environment (WSL)...
    wsl -d Ubuntu -e bash -lc "cd /mnt/c/Users/Abhishek/Downloads/ZenForge/backend; if [ ! -d .venv ]; then python3 -m venv .venv; fi"
    
    REM Detect WSL IP and sync frontend API URL
    set "WSL_IP="
    for /f %%i in ('wsl -d Ubuntu -e bash -lc "hostname -I | awk '{print $1}'"') do set "WSL_IP=%%i"
    if "%WSL_IP%"=="" set "WSL_IP=localhost"
    echo 🌐 Using backend host: %WSL_IP%:8000
    > frontend\.env.local echo NEXT_PUBLIC_API_URL=http://%WSL_IP%:8000
    
    REM Setup frontend environment
    echo 📦 Setting up frontend environment...
    cd frontend
    if not exist node_modules (
        echo Installing frontend dependencies...
        npm install
    )
    cd ..
    
    echo.
    echo 🚀 Starting GuruCortex services...
    
    REM Start Ollama
    echo [1/4] Starting Ollama AI service...
    start /MIN "Ollama" cmd /c "ollama serve"
    timeout /t 3 /nobreak >nul
    
    REM Start Backend
    echo [2/4] Starting Backend API server (WSL)...
    start "GuruCortex Backend - Keep Open" wsl -d Ubuntu -e bash -lc "cd /mnt/c/Users/Abhishek/Downloads/ZenForge/backend; source .venv/bin/activate; python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
    timeout /t 8 /nobreak >nul
    
    REM Start Frontend
    echo [3/4] Starting Frontend web server...
    cd frontend
    start "GuruCortex Frontend - Keep Open" cmd /k "npm run dev"
    cd ..
    timeout /t 12 /nobreak >nul
    
    REM Open application
    echo [4/4] Opening GuruCortex application...
    timeout /t 5 /nobreak >nul
    
    echo.
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║                    🎉 GURUCORTEX READY! 🎉                   ║
    echo ║                      WSL Backend Mode                        ║
    echo ║                                                              ║
    echo ║  🌐 Dashboard: http://localhost:3000/dashboard               ║
    echo ║  🔧 API Docs:  http://%WSL_IP%:8000/docs                    ║
    echo ║                                                              ║
    echo ║  💡 Two service windows opened:                              ║
    echo ║     - Backend (Python FastAPI - WSL)                        ║
    echo ║     - Frontend (Next.js)                                    ║
    echo ║                                                              ║
    echo ║  🛑 Close both service windows to stop GuruCortex           ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    
    set BACKEND_URL=%WSL_IP%:8000
)

echo 🚀 Opening GuruCortex in browser...
start "" "http://localhost:3000/dashboard"

echo.
echo ✅ GuruCortex AI Learning Companion is now running!
echo.
echo 💡 OFFLINE FEATURES READY:
echo    📄 Document processing ^& RAG (PDF, DOCX, PPTX)
echo    🤖 AI Chat with local models (requires Ollama setup)
echo    📝 Adaptive Quiz System with spaced repetition
echo    💻 Code Execution Sandbox (Python, JavaScript, etc.)
echo    🎵 Podcast Generation from documents
echo    👨‍🎓 Protégé Teaching System (learn by teaching AI)
echo    📅 Study Planner with intelligent scheduling
echo    🏆 Achievement Badges and progress tracking
echo    📱 Focus monitoring with camera analysis
echo    ♿ Accessibility features and theme options
echo    📊 All analytics and learning data stored locally
echo.
echo 🔒 PRIVACY: No data ever leaves your machine!
echo 🌐 Backend running on: %BACKEND_URL%
echo.
echo 📖 For complete offline setup, choose option 3 next time
echo.
echo Press any key to exit this launcher (services will keep running)...
pause >nul