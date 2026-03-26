@echo off
REM ============================================
REM ZenForge - Windows Deploy Script
REM ============================================
REM Usage: deploy.bat [start|stop|restart|status|logs]
REM
REM Prerequisites:
REM   1. Docker Desktop installed and running
REM   2. Ollama installed with model pulled
REM      - Install: https://ollama.com/download
REM      - Pull model: ollama pull mistral:7b
REM ============================================

if "%1"=="" goto start
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="status" goto status
if "%1"=="logs" goto logs
echo Usage: deploy.bat [start^|stop^|restart^|status^|logs]
exit /b 1

:start
echo.
echo   ======================================
echo       ZenForge - AI Learning OS
echo     100%% Local  ^|  100%% Private
echo   ======================================
echo.

REM Check Docker
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Start Docker Desktop first.
    exit /b 1
)
echo [OK] Docker is running

REM Check Ollama
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo [WARN] Ollama is not running on localhost:11434
    echo   Start Ollama and run: ollama pull mistral:7b
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
) else (
    echo [OK] Ollama is running
)

echo.
echo Building and starting ZenForge...
echo This may take 5-10 minutes on first run.
echo.

docker compose up -d --build

echo.
echo ============================================
echo   ZenForge is running!
echo ============================================
echo.
echo   Frontend:  http://localhost:3000/dashboard
echo   Backend:   http://localhost:8000/docs
echo   Health:    http://localhost:8000/health
echo.
echo   Stop:      deploy.bat stop
echo   Logs:      deploy.bat logs
echo.
goto end

:stop
echo Stopping ZenForge...
docker compose down
echo Stopped.
goto end

:restart
call :stop
call :start
goto end

:status
echo.
echo Container Status:
docker compose ps
echo.
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo Backend:  NOT RESPONDING
) else (
    echo Backend:  HEALTHY
)
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo Frontend: NOT RESPONDING
) else (
    echo Frontend: RUNNING
)
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo Ollama:   NOT RUNNING
) else (
    echo Ollama:   CONNECTED
)
goto end

:logs
docker compose logs -f --tail=50
goto end

:end
