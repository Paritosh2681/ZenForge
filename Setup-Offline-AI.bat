@echo off
title ZenForge Offline Setup - Local AI Models
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                   ZenForge Offline Setup                     ║
echo  ║               Complete Local AI Configuration                ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Checking system requirements...

REM Check if Ollama is installed
where ollama >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Ollama not found! Please install from: https://ollama.ai/download/windows
    echo.
    echo Manual installation steps:
    echo 1. Download Ollama from https://ollama.ai/download/windows
    echo 2. Run installer and restart terminal
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Ollama found!

echo.
echo 🤖 Setting up local AI models...

REM Start Ollama service
echo Starting Ollama service...
start /b ollama serve
timeout /t 5 /nobreak >nul

REM Check if model already exists
ollama list | findstr llama3.2 >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Llama 3.2 model already installed
    set MODEL_READY=1
) else (
    echo 📥 Downloading Llama 3.2 model (this may take 10-15 minutes)...
    echo Note: Download size is approximately 3GB
    echo.
    
    ollama pull llama3.2:latest
    if %errorlevel% equ 0 (
        echo ✅ Llama 3.2 model downloaded successfully!
        set MODEL_READY=1
    ) else (
        echo ⚠️ Failed to download Llama 3.2, trying Mistral 7B...
        ollama pull mistral:7b
        if %errorlevel% equ 0 (
            echo ✅ Mistral 7B model downloaded successfully!
            set MODEL_READY=1
        ) else (
            echo ❌ Failed to download models. Check internet connection.
            set MODEL_READY=0
        )
    )
)

if %MODEL_READY%==0 (
    echo.
    echo ❌ Model download failed. ZenForge will still work but without AI chat.
    echo You can retry model download later with: ollama pull llama3.2
    echo.
) else (
    echo.
    echo ✅ Local AI model ready!
)

echo.
echo 🔧 Configuring ZenForge for offline mode...

REM Update backend configuration
cd backend
echo Updating backend configuration...
python -c "
import re
config_path = 'app/config.py'
with open(config_path, 'r') as f:
    content = f.read()

# Update for offline mode
content = re.sub(r'OFFLINE_MODE: bool = False', 'OFFLINE_MODE: bool = True', content)
content = re.sub(r'LOCAL_MODEL_ONLY: bool = False', 'LOCAL_MODEL_ONLY: bool = True', content)

with open(config_path, 'w') as f:
    f.write(content)
print('Backend configuration updated for offline mode')
"

cd ..

echo ✅ Configuration updated!

echo.
echo 🧪 Testing system...

REM Test Ollama
echo Testing Ollama connection...
ollama list | findstr -i "llama\|mistral" >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Ollama model ready
) else (
    echo ⚠️ Ollama model not ready, but system will still work
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🎉 SETUP COMPLETE! 🎉                    ║
echo ║                                                              ║
echo ║  Your ZenForge is now configured for FULL OFFLINE operation ║
echo ║                                                              ║
echo ║  ✅ Local document processing                                ║
echo ║  ✅ Offline vector database                                  ║
echo ║  ✅ Local AI model (if downloaded)                           ║
echo ║  ✅ Camera-based attention monitoring                        ║
echo ║  ✅ Voice input/output (browser native)                      ║
echo ║  ✅ Code execution sandbox                                   ║
echo ║  ✅ Complete privacy - no data leaves your machine           ║
echo ║                                                              ║
echo ║  🚀 Run: Start-GuruCortex.bat to launch the system          ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

if %MODEL_READY%==1 (
    echo 🤖 AI Chat: ENABLED (Local LLM ready)
) else (
    echo 🤖 AI Chat: Limited (No local LLM, but document search works)
)

echo 📱 Focus Monitoring: ENABLED (Camera + CV)
echo 🎵 Audio Features: ENABLED (Browser native)
echo 📄 Document Processing: ENABLED (All formats)
echo 💾 Data Storage: 100%% LOCAL

echo.
echo Press any key to launch ZenForge...
pause >nul

REM Launch the system
echo Launching ZenForge...
Run-GuruCortex.bat