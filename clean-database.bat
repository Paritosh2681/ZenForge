@echo off
REM =============================================================================
REM Clean Database Script - Remove All Mock/Test Conversations
REM =============================================================================
REM This script clears all conversations and messages, giving you a fresh slate

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     CLEANING DATABASE - Removing Mock Conversations        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set DB_PATH=d:\Hackethon\AMD\ZenForge\data\conversations.db

REM Check if database exists
if not exist "%DB_PATH%" (
    echo [ERROR] Database not found at: %DB_PATH%
    exit /b 1
)

echo [1] Creating backup of current database...
copy "%DB_PATH%" "%DB_PATH%.backup-before-clean" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Failed to backup database
    exit /b 1
) else (
    echo [OK] Backup saved as: conversations.db.backup-before-clean
)

echo.
echo [2] Removing WAL and SHM lock files...
if exist "%DB_PATH%-shm" del "%DB_PATH%-shm"
if exist "%DB_PATH%-wal" del "%DB_PATH%-wal"
echo [OK] Lock files cleaned

echo.
echo [3] Clearing all conversations and messages...
REM Delete all data but keep the schema
(
    echo DELETE FROM quiz_responses;
    echo DELETE FROM quiz_sessions;
    echo DELETE FROM questions;
    echo DELETE FROM quizzes;
    echo DELETE FROM context_summaries;
    echo DELETE FROM conversation_documents;
    echo DELETE FROM messages;
    echo DELETE FROM conversations;
    echo DELETE FROM code_executions;
    echo PRAGMA optimize;
) | sqlite3 "%DB_PATH%"

if errorlevel 1 (
    echo [ERROR] Failed to clear database
    echo [ACTION] Restoring from backup...
    copy "%DB_PATH%.backup-before-clean" "%DB_PATH%" >nul 2>&1
    exit /b 1
) else (
    echo [OK] All mock conversations and messages removed
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║              ✓ DATABASE SUCCESSFULLY CLEANED               ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo The database is now empty and ready for your real conversations.
echo Refresh your browser to see the clean slate.
echo.
echo Backup location: %DB_PATH%.backup-before-clean
echo (You can restore this if needed)
echo.

exit /b 0
