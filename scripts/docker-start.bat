@echo off
REM Guru-Agent Docker Startup Script (Windows)

echo ==========================================
echo Guru-Agent - Docker Setup
echo ==========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed.
    echo Please install Docker Desktop from: https://docs.docker.com/desktop/windows/install/
    pause
    exit /b 1
)

REM Check if Ollama is running on host
echo Checking if Ollama is running on host...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Ollama not detected on host
    echo Using docker-compose.full.yml (includes Ollama in Docker)
    set COMPOSE_FILE=docker-compose.full.yml
    set PULL_MODEL=1
) else (
    echo [OK] Ollama detected on host (localhost:11434)
    echo Using docker-compose.yml (connects to host Ollama)
    set COMPOSE_FILE=docker-compose.yml
    set PULL_MODEL=0
)

echo.
echo Building and starting containers...
echo.

REM Build and start
docker-compose -f %COMPOSE_FILE% up --build -d

echo.
echo ==========================================
echo Guru-Agent Started!
echo ==========================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo.

if "%PULL_MODEL%"=="1" (
    echo Pulling Mistral model (first time only, ~4.4GB)...
    echo This may take a few minutes...
    echo.
    docker exec guru-agent-ollama ollama pull mistral:7b
    echo.
    echo [OK] Mistral model ready!
)

echo.
echo View logs: docker-compose -f %COMPOSE_FILE% logs -f
echo Stop:      docker-compose -f %COMPOSE_FILE% down
echo.
echo ==========================================
pause
