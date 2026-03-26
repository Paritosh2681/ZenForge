@echo off
title ZenForge - AI Learning OS
color 0A

echo.
echo   ======================================
echo       ZenForge - AI Learning OS
echo     100%% Local  ^|  100%% Private
echo   ======================================
echo.

REM ---- Step 1: Start Ollama ----
echo [1/3] Starting Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I "ollama.exe" >NUL
if %ERRORLEVEL% NEQ 0 (
    echo   Starting Ollama server...
    set OLLAMA_HOST=0.0.0.0:11434
    start "" "C:\Users\Abhishek\AppData\Local\Programs\Ollama\ollama.exe" serve
    timeout /t 5 /nobreak >NUL
) else (
    echo   Ollama already running.
)

REM ---- Step 2: Start Backend (WSL) ----
echo [2/3] Starting Backend (WSL)...
wsl -d Ubuntu -e bash -c "pkill -f 'uvicorn app.main:app' 2>/dev/null; sleep 1; cd /mnt/c/Users/Abhishek/Downloads/ZenForge/backend && nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/zenforge-backend.log 2>&1 &"
echo   Backend starting on http://localhost:8000

REM ---- Step 3: Start Frontend ----
echo [3/3] Starting Frontend...
cd /d "C:\Users\Abhishek\Downloads\ZenForge\frontend"
start "" cmd /c "npm run dev > NUL 2>&1"
echo   Frontend starting on http://localhost:3000

echo.
echo   Waiting for services to be ready...
timeout /t 15 /nobreak >NUL

echo.
echo   ============================================
echo     ZenForge is READY!
echo   ============================================
echo.
echo     Open: http://localhost:3000/dashboard
echo.
echo     Press any key to open in browser...
pause >NUL

start http://localhost:3000/dashboard
