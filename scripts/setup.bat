@echo off
REM Guru-Agent Setup Script (Windows)
REM Phase 1: Local RAG Foundation

echo ======================================
echo Guru-Agent Setup - Phase 1
echo ======================================
echo.

REM Check Python
echo Checking Python version...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.10+
    exit /b 1
)
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [OK] Python %PYTHON_VERSION%

REM Check Node.js
echo Checking Node.js version...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    exit /b 1
)
for /f "tokens=1" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION%

REM Check Ollama
echo Checking Ollama installation...
ollama --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Ollama not found
    echo Please install from: https://ollama.ai
    echo Then run: ollama pull mistral:7b
    pause
) else (
    echo [OK] Ollama installed

    REM Check Mistral model
    echo Checking Mistral model...
    ollama list | findstr "mistral:7b" >nul
    if errorlevel 1 (
        echo Downloading Mistral-7B model...
        ollama pull mistral:7b
    ) else (
        echo [OK] Mistral-7B available
    )
)

REM Backend setup
echo.
echo Setting up backend...
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

echo [OK] Backend setup complete

cd ..

REM Frontend setup
echo.
echo Setting up frontend...
cd frontend

if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
)

if not exist ".env.local" (
    echo Creating .env.local file...
    copy .env.local.example .env.local
)

echo [OK] Frontend setup complete

cd ..

REM Final instructions
echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo To start Guru-Agent:
echo.
echo 1. Terminal 1 - Backend:
echo    cd backend
echo    venv\Scripts\activate
echo    python -m app.main
echo.
echo 2. Terminal 2 - Frontend:
echo    cd frontend
echo    npm run dev
echo.
echo 3. Open browser:
echo    http://localhost:3000
echo.
echo API Documentation: http://localhost:8000/docs
echo.
pause
