@echo off
title ZenForge Backend
echo ==========================================
echo   Starting ZenForge Backend (FastAPI)
echo ==========================================
echo.

cd /d "d:\Hackethon\AMD\ZenForge\backend"

echo Checking Python...
python --version 2>NUL || python3 --version 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python not found! Please install Python 3.10+
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
python -m pip install -r requirements.txt -q

echo.
echo Starting server on http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
