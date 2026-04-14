#!/usr/bin/env python3
"""
Clean Database Script - Remove all mock/test conversations
Keeps the schema but clears all data, giving a fresh slate
"""

import sqlite3
import os
from pathlib import Path
import shutil
from datetime import datetime

DB_PATH = Path("d:/Hackethon/AMD/ZenForge/data/conversations.db")

def clean_database():
    """Clear all conversations and related data"""
    
    if not DB_PATH.exists():
        print(f"[ERROR] Database not found at: {DB_PATH}")
        return False
    
    # Create backup
    print("[1] Creating backup of current database...")
    backup_path = DB_PATH.with_suffix(f'.backup-{datetime.now().strftime("%Y%m%d-%H%M%S")}')
    try:
        shutil.copy2(DB_PATH, backup_path)
        print(f"[OK] Backup saved as: {backup_path.name}")
    except Exception as e:
        print(f"[ERROR] Failed to backup: {e}")
        return False
    
    # Clean lock files
    print("\n[2] Removing lock files...")
    for lock_file in [DB_PATH.with_suffix('.db-shm'), DB_PATH.with_suffix('.db-wal')]:
        if lock_file.exists():
            try:
                lock_file.unlink()
                print(f"[OK] Removed: {lock_file.name}")
            except Exception as e:
                print(f"[WARNING] Could not remove {lock_file.name}: {e}")
    
    # Connect and clean
    print("\n[3] Clearing all conversations and messages...")
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        # Disable foreign keys temporarily to avoid constraint issues
        cursor.execute("PRAGMA foreign_keys = OFF")
        
        # Delete all data (keeping schema)
        delete_queries = [
            "DELETE FROM quiz_responses;",
            "DELETE FROM quiz_sessions;",
            "DELETE FROM questions;",
            "DELETE FROM quizzes;",
            "DELETE FROM context_summaries;",
            "DELETE FROM conversation_documents;",
            "DELETE FROM messages;",
            "DELETE FROM conversations;",
            "DELETE FROM code_executions;",
            "DELETE FROM topic_mastery;",
            "DELETE FROM study_plans;",
            "DELETE FROM badges;",
        ]
        
        deleted_rows = 0
        for query in delete_queries:
            try:
                cursor.execute(query)
                deleted_rows += cursor.rowcount
            except sqlite3.OperationalError as e:
                # Table might not exist, that's ok
                pass
        
        # Re-enable foreign keys
        cursor.execute("PRAGMA foreign_keys = ON")
        
        # Optimize database
        cursor.execute("PRAGMA optimize;")
        
        conn.commit()
        conn.close()
        
        print(f"[OK] Deleted {deleted_rows} records")
        
    except Exception as e:
        print(f"[ERROR] Failed to clean database: {e}")
        print(f"[ACTION] Attempting to restore from backup...")
        try:
            shutil.copy2(backup_path, DB_PATH)
            print("[OK] Database restored from backup")
        except:
            pass
        return False
    
    # Verify
    print("\n[4] Verifying database is empty...")
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        checks = {
            "conversations": "SELECT COUNT(*) FROM conversations",
            "messages": "SELECT COUNT(*) FROM messages",
            "quizzes": "SELECT COUNT(*) FROM quizzes",
        }
        
        all_empty = True
        for table_name, query in checks.items():
            try:
                cursor.execute(query)
                count = cursor.fetchone()[0]
                status = "✓ Empty" if count == 0 else f"⚠ Contains {count} records"
                print(f"  {table_name}: {status}")
                if count > 0:
                    all_empty = False
            except:
                pass
        
        conn.close()
        
        if all_empty:
            print("\n" + "="*60)
            print("✓ DATABASE SUCCESSFULLY CLEANED")
            print("="*60)
            print("\nThe database is now empty and ready for your real conversations.")
            print(f"Backup location: {backup_path}")
            print("Refresh your browser to see the clean slate.\n")
            return True
        else:
            print("\n[WARNING] Database still contains data")
            return False
            
    except Exception as e:
        print(f"[ERROR] Verification failed: {e}")
        return False

if __name__ == "__main__":
    print("\n" + "="*60)
    print("CLEANING DATABASE - Removing Mock Conversations")
    print("="*60 + "\n")
    
    success = clean_database()
    exit(0 if success else 1)
