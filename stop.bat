@echo off
title ZenForge - Stopping...
echo Stopping ZenForge...

REM Stop frontend (node)
taskkill /F /IM "node.exe" 2>NUL
echo   Frontend stopped.

REM Stop backend (WSL uvicorn)
wsl -d Ubuntu -e bash -c "pkill -f 'uvicorn app.main:app' 2>/dev/null"
echo   Backend stopped.

echo.
echo ZenForge stopped.
timeout /t 3 /nobreak >NUL
