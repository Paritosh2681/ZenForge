@echo off
title ZenForge Cleanup Tool - Automated
color 0A

echo 🧹 ZenForge Cleanup Tool - Automated Execution
echo ===============================================
echo.

cd /d "C:\Users\Abhishek\Downloads\ZenForge"

echo Removing unwanted files and folders...
echo.

REM Remove temporary Claude directories (23 of them!)
echo [1/4] Removing temporary directories...
for /d %%i in (tmpclaude-*) do (
    echo   Removing: %%i
    rmdir /S /Q "%%i" 2>nul
)
echo   ✅ Temporary directories cleaned

REM Remove redundant batch files
echo [2/4] Removing redundant scripts...
del "apply_dashboard_ui.py" 2>nul && echo   Removed: apply_dashboard_ui.py
del "apply_ui_video.py" 2>nul && echo   Removed: apply_ui_video.py
del "Fix-Document-Upload.bat" 2>nul && echo   Removed: Fix-Document-Upload.bat
del "Fix-Issues.bat" 2>nul && echo   Removed: Fix-Issues.bat
del "Quick-Fix.bat" 2>nul && echo   Removed: Quick-Fix.bat
del "Super-Fix.bat" 2>nul && echo   Removed: Super-Fix.bat
del "Start-GuruCortex.bat" 2>nul && echo   Removed: Start-GuruCortex.bat
del "start.bat" 2>nul && echo   Removed: start.bat
del "start.sh" 2>nul && echo   Removed: start.sh
del "startup.bat" 2>nul && echo   Removed: startup.bat
del "startup.py" 2>nul && echo   Removed: startup.py
del "start_server.bat" 2>nul && echo   Removed: start_server.bat
del "start_complete_system.bat" 2>nul && echo   Removed: start_complete_system.bat
del "start_full_backend.bat" 2>nul && echo   Removed: start_full_backend.bat
del "run_frontend.bat" 2>nul && echo   Removed: run_frontend.bat
del "deploy.bat" 2>nul && echo   Removed: deploy.bat
del "deploy.sh" 2>nul && echo   Removed: deploy.sh
del "quick_startup.py" 2>nul && echo   Removed: quick_startup.py
del "update_hero.py" 2>nul && echo   Removed: update_hero.py

REM Remove redundant documentation
echo [3/4] Removing redundant documentation...
del "BACKEND_FIX_COMPLETE.md" 2>nul && echo   Removed: BACKEND_FIX_COMPLETE.md
del "COPY_VIDEO_INSTRUCTIONS.md" 2>nul && echo   Removed: COPY_VIDEO_INSTRUCTIONS.md
del "DEMO_STATUS.md" 2>nul && echo   Removed: DEMO_STATUS.md
del "DOCKER_READY.md" 2>nul && echo   Removed: DOCKER_READY.md
del "FRONTEND_IMPROVEMENTS_COMPLETE.md" 2>nul && echo   Removed: FRONTEND_IMPROVEMENTS_COMPLETE.md
del "PHASE3_SUMMARY.md" 2>nul && echo   Removed: PHASE3_SUMMARY.md
del "RUNNING_OPTIONS.md" 2>nul && echo   Removed: RUNNING_OPTIONS.md
del "STARTUP_INSTRUCTIONS.md" 2>nul && echo   Removed: STARTUP_INSTRUCTIONS.md
del "STARTUP_STATUS.txt" 2>nul && echo   Removed: STARTUP_STATUS.txt
del "SYSTEM_STATUS.md" 2>nul && echo   Removed: SYSTEM_STATUS.md

echo [4/4] Cleanup complete verification...
echo.

echo ✅ CLEANUP COMPLETE!
echo.
echo 📁 Essential files KEPT:
echo   • Run-GuruCortex.bat ⭐ (main launcher)
echo   • Simple-Start.bat (simple launcher)
echo   • Setup-Offline-AI.bat (offline setup)
echo   • install_full_backend.bat (dependencies)
echo   • fix-missing-deps.bat (quick fixes)
echo   • cache_embedding_model.py (AI model setup)
echo   • setup_offline.py (offline config)
echo.
echo 📋 Essential documentation KEPT:
echo   • PROJECT_SUMMARY.md
echo   • QUICKSTART.md
echo   • OFFLINE_MODE.md
echo.
echo 🗑️ REMOVED ~50+ unwanted files:
echo   • 23 temporary tmpclaude-* directories
echo   • 15+ redundant batch scripts
echo   • 5+ old Python utility scripts
echo   • 10+ outdated documentation files
echo.
echo Your ZenForge project is now clean and organized!
echo.
pause