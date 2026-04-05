@echo off
title ZenForge Frontend
echo ==========================================
echo   Starting ZenForge Frontend (Next.js)
echo ==========================================
echo.

cd /d "d:\Hackethon\AMD\ZenForge\frontend"

echo Checking Node.js...
node --version 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found! Please install Node.js 18+
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
call npm install

echo.
echo Starting frontend on http://localhost:3000
echo.
call npm run dev
pause
