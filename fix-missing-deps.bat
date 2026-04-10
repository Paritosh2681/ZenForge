@echo off
title Quick Dependency Fix
color 0E

echo 🚀 Quick Fix: Installing Missing Dependencies
echo ==============================================

echo Installing chromadb...
python -m pip install chromadb --user --break-system-packages

echo Installing tiktoken...
python -m pip install tiktoken --user --break-system-packages

echo Installing sentence-transformers...
python -m pip install sentence-transformers --user --break-system-packages

echo.
echo ✅ Key dependencies installed!
echo 🚀 Close the backend window and restart Simple-Start.bat
echo.
pause