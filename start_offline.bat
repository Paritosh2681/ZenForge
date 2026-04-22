@echo off
title ZenForge Offline System
color 0A

echo ============================================================
echo ZenForge Offline Mode - Starting Services
echo 100%% Local  ^|  100%% Private  
echo ============================================================
echo.

echo [1/3] Configuring frontend...
cd frontend
echo NEXT_PUBLIC_API_URL=http://localhost:8001 > .env.local
echo Frontend configured for localhost:8001

echo [2/3] Starting backend...
cd ..\backend
start "ZenForge Backend" cmd /k ".\.venv_win\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

echo [3/3] Starting frontend...
cd ..\frontend  
start "ZenForge Frontend" cmd /k "npm run dev"

echo.
echo ============================================================
echo ZENFORGE IS STARTING!
echo ============================================================
echo.
echo Backend API: http://localhost:8001
echo API Docs: http://localhost:8001/docs
echo Frontend: http://localhost:3000
echo Dashboard: http://localhost:3000/dashboard
echo.
echo Opening dashboard in browser...
timeout /t 10 /nobreak >nul
start "" "http://localhost:3000/dashboard"

echo.
echo ============================================================
echo OFFLINE FEATURES READY:
echo - Document processing ^& RAG (PDF, DOCX, PPTX)
echo - AI Chat with Ollama (llama3.2:latest)  
echo - Adaptive Quiz System
echo - Code Execution Sandbox
echo - Podcast Generation
echo - Study Planner
echo - Achievement Badges
echo - Focus monitoring
echo - Local analytics
echo.
echo PRIVACY: 100%% local - no data leaves your machine!
echo.
echo Close the backend and frontend windows to stop ZenForge
echo ============================================================
echo.
pause