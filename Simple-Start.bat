@echo off
title Simple Start - No Virtual Environment
color 0A

echo 🚀 Simple Start: ZenForge (Direct Python Mode)
echo =============================================
echo.

REM Fix frontend URL
echo [1/3] Configuring frontend...
cd frontend
echo NEXT_PUBLIC_API_URL=http://localhost:8001 > .env.local
echo ✅ Frontend configured

REM Start frontend
echo [2/3] Starting frontend...
start "ZenForge Frontend" cmd /k "npm run dev"

REM Start backend directly
echo [3/3] Starting backend...
cd ..\backend
start "ZenForge Backend" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

echo.
echo 🌐 Opening ZenForge...
timeout /t 5 /nobreak >nul
start "" "http://localhost:3000/dashboard"

echo.
echo ✅ ZenForge started in simple mode!
echo 📝 Both services running in separate windows
echo 🛑 Close both windows to stop ZenForge
echo.
pause