@echo off
title ZenForge Launcher
color 0A

echo.
echo   ======================================
echo       ZenForge - AI Learning OS
echo     100%% Local  ^|  100%% Private
echo   ======================================
echo.

REM ---- Start Backend in new window ----
echo [1/2] Starting Backend (FastAPI)...
start "ZenForge Backend" cmd /c "d:\Hackethon\AMD\ZenForge\start-backend.bat"
echo      Backend starting on http://localhost:8000

REM Wait for backend to initialize
timeout /t 5 /nobreak >NUL

REM ---- Start Frontend in new window ----
echo [2/2] Starting Frontend (Next.js)...
start "ZenForge Frontend" cmd /c "d:\Hackethon\AMD\ZenForge\start-frontend.bat"
echo      Frontend starting on http://localhost:3000

echo.
echo   ============================================
echo     Services are starting...
echo   ============================================
echo.
echo     Backend API:  http://localhost:8000
echo     API Docs:     http://localhost:8000/docs
echo     Frontend:     http://localhost:3000
echo.
echo   Waiting 15 seconds for services to be ready...
timeout /t 15 /nobreak >NUL

echo.
echo   Opening browser...
start http://localhost:3000

echo.
echo   ZenForge is running!
echo   Close this window to keep services running.
echo   To stop: Close the Backend and Frontend windows.
echo.
pause
