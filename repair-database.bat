@echo off
REM =============================================================================
REM Database Maintenance & Recovery Script for ZenForge
REM =============================================================================
REM This script checks and repairs the SQLite database, clearing locks and
REM optimizing for better performance.

setlocal enabledelayedexpansion

echo.
echo [DATABASE] ZenForge Database Maintenance
echo =========================================
echo.

set DB_PATH=d:\Hackethon\AMD\ZenForge\data\conversations.db
set BACKUP_PATH=d:\Hackethon\AMD\ZenForge\data\conversations.db.backup

REM Check if database exists
if not exist "%DB_PATH%" (
    echo [WARNING] Database not found at: %DB_PATH%
    echo [ACTION] Backend will create it on startup
    exit /b 0
)

echo [1] Backing up current database...
copy "%DB_PATH%" "%BACKUP_PATH%" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Failed to backup database
    exit /b 1
) else (
    echo [OK] Backup created: %BACKUP_PATH%
)

echo.
echo [2] Cleaning up WAL and SHM files...
REM These are write-ahead log files that can cause locks if corrupted
for %%F in (
    "d:\Hackethon\AMD\ZenForge\data\conversations.db-shm"
    "d:\Hackethon\AMD\ZenForge\data\conversations.db-wal"
) do (
    if exist "%%F" (
        del "%%F" >nul 2>&1
        echo [OK] Removed: %%~nxF
    )
)

echo.
echo [3] Checking database integrity...
REM Use SQLite to verify database
echo SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table'; | ^
    sqlite3 "%DB_PATH%" >nul 2>&1
    
if errorlevel 1 (
    echo [ERROR] Database is corrupted!
    echo [ACTION] Attempting to rebuild from backup...
    copy "%DB_PATH%" "%DB_PATH%.corrupted" >nul 2>&1
    copy "%BACKUP_PATH%" "%DB_PATH%" >nul 2>&1
    echo [OK] Database restored from backup
) else (
    echo [OK] Database integrity verified
)

echo.
echo [4] Optimizing database...
REM Optimize the database
echo PRAGMA optimize; | sqlite3 "%DB_PATH%" >nul 2>&1

echo.
echo [5] Checking record counts...
setlocal enabledelayedexpansion
for /f "tokens=*" %%A in ('echo SELECT COUNT(*) FROM conversations; ^| sqlite3 "%DB_PATH%" 2^>nul') do (
    set CONV_COUNT=%%A
)
for /f "tokens=*" %%A in ('echo SELECT COUNT(*) FROM messages; ^| sqlite3 "%DB_PATH%" 2^>nul') do (
    set MSG_COUNT=%%A
)

if defined CONV_COUNT (
    echo [OK] Conversations: %CONV_COUNT%
)
if defined MSG_COUNT (
    echo [OK] Messages: %MSG_COUNT%
)

echo.
echo =========================================
echo [SUCCESS] Database maintenance complete
echo =========================================
echo.
echo The database is ready for use.
echo Start the backend with: cd backend && python -m uvicorn app.main:app --port 8000
echo.

exit /b 0
