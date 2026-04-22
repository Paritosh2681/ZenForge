#!/usr/bin/env python3
"""
Document Sync Utility - Synchronize disk files with database records
Fixes the issue where documents exist on disk but aren't tracked in the database
"""

import asyncio
import sqlite3
from pathlib import Path
from datetime import datetime
import sys

# Add backend to path
sys.path.insert(0, 'd:/Hackethon/AMD/ZenForge/backend')

async def sync_documents():
    """
    Scan uploaded documents directory and sync with database
    - Documents on disk but not in DB: Add to DB
    - Documents in DB but not on disk: Remove from DB (corrupted upload)
    """
    
    db_path = Path("d:/Hackethon/AMD/ZenForge/data/conversations.db")
    upload_dir = Path("d:/Hackethon/AMD/ZenForge/data/uploads")
    
    print("\n" + "="*60)
    print("DOCUMENT SYNC UTILITY")
    print("="*60)
    
    # Get files on disk
    print("\n[1] Scanning disk for documents...")
    disk_files = {}
    if upload_dir.exists():
        for file_path in upload_dir.glob("*"):
            if file_path.is_file() and file_path.name != ".gitkeep":
                # Parse filename: {uuid}_{original_filename}
                parts = file_path.name.split("_", 1)
                if len(parts) == 2:
                    file_id = parts[0]
                    original_name = parts[1]
                    disk_files[file_id] = {
                        "path": file_path,
                        "name": original_name,
                        "size": file_path.stat().st_size,
                        "ext": file_path.suffix.lower()
                    }
                    print(f"  Found: {original_name} ({file_id[:8]}...)")
    
    if not disk_files:
        print("  No documents found on disk")
    
    # Get documents in database
    print("\n[2] Checking database records...")
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()
    cursor.execute("SELECT id, filename FROM documents")
    db_docs = {row[0]: row[1] for row in cursor.fetchall()}
    
    if not db_docs:
        print("  No documents found in database")
    else:
        print(f"  Found {len(db_docs)} documents in database")
    
    # Find orphaned records (in DB but not on disk)
    print("\n[3] Checking for orphaned database records...")
    orphaned = set(db_docs.keys()) - set(disk_files.keys())
    
    if orphaned:
        print(f"  Found {len(orphaned)} orphaned records (will delete):")
        for doc_id in orphaned:
            print(f"    - {db_docs[doc_id]} ({doc_id[:8]}...)")
            cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        conn.commit()
        print("  ✓ Orphaned records deleted")
    else:
        print("  ✓ No orphaned records found")
    
    # Find missing records (on disk but not in DB)
    print("\n[4] Checking for unregistered files...")
    missing = set(disk_files.keys()) - set(db_docs.keys())
    
    if missing:
        print(f"  Found {len(missing)} unregistered files (will add to DB):")
        for file_id in missing:
            file_info = disk_files[file_id]
            print(f"    - {file_info['name']} ({file_id[:8]}...)")
            
            # Determine file type
            file_type = file_info['ext'].lstrip('.')
            
            # Add to database
            cursor.execute("""
                INSERT OR REPLACE INTO documents (
                    id, filename, file_type, file_size, chunks_created, upload_date
                ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (
                file_id,
                file_info['name'],
                file_type,
                file_info['size'],
                0  # chunks_created unknown, will be updated on reprocessing
            ))
        
        conn.commit()
        print("  ✓ Files added to database")
    else:
        print("  ✓ All disk files are registered in database")
    
    conn.close()
    
    # Summary
    print("\n" + "="*60)
    print("SYNC COMPLETE")
    print("="*60)
    print(f"\nTotal files on disk: {len(disk_files)}")
    print(f"Total records in DB: {len(db_docs) - len(orphaned) + len(missing)}")
    print(f"Orphaned records removed: {len(orphaned)}")
    print(f"Missing records added: {len(missing)}")
    
    if orphaned or missing:
        print("\n✓ Database has been synchronized!")
        print("\nNext steps:")
        print("1. Restart backend: cd backend && python -m uvicorn app.main:app --port 8000")
        print("2. Refresh browser")
        print("3. Documents should now appear in the Docs tab\n")
    else:
        print("\n✓ Database is already in sync!\n")

if __name__ == "__main__":
    asyncio.run(sync_documents())
