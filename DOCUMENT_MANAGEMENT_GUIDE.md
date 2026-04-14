# 📚 DOCUMENT MANAGEMENT - COMPLETE GUIDE

## ✅ What Was Fixed

### Issue 1: Documents Disappeared After Refresh
**Status:** ✅ FIXED

**Solution:** Created `sync_documents.py` to sync disk files with database
- Scans upload directory for files
- Checks database for corresponding records
- Adds missing records automatically

**How to use:**
```powershell
cd d:\Hackethon\AMD\ZenForge
python sync_documents.py
```

---

### Issue 2: AI Used Deleted Documents
**Status:** ✅ FIXED

**Solution:** Enhanced delete endpoint to clean up completely

**What happens when you delete a document now:**
1. ✅ Removed from database (documents table)
2. ✅ Removed from disk (`/data/uploads/`)
3. ✅ Removed from RAG cache (vector embeddings)

**Result:** AI cannot access deleted documents

---

### Issue 3: Documents Not Showing in UI
**Status:** ✅ FIXED

**Solution:** Re-synced documents with database

**Current Status:**
- Document: `OE_Assignment-2.pdf`
- Visible in: ✅ Docs tab
- In Database: ✅ Yes
- On Disk: ✅ Yes
- Ready to Use: ✅ Yes

---

## 🎯 How Document Management Works Now

### Complete Workflow:

```
┌─────────────────────────────────────────┐
│  1. UPLOAD DOCUMENT                     │
│     Click upload → Select file          │
└──────────────────┬──────────────────────┘
                   ↓
    ┌─────────────────────────────────┐
    │  File saved to disk:            │
    │  /data/uploads/{id}_{filename}  │
    │  Record added to database       │
    └──────────────────┬──────────────┘
                       ↓
            ┌──────────────────────┐
            │  2. DOCUMENT VISIBLE │
            │  In "Docs" tab       │
            │  Show file info:     │
            │  - Name              │
            │  - Type              │
            │  - Size              │
            │  - Chunks processed  │
            └──────────────────────┘
                       ↓
            ┌──────────────────────┐
            │  3. USE IN CHAT      │
            │  Select document     │
            │  Click "Ask File"    │
            │  Or "Chat with..."   │
            └──────────────────────┘
                       ↓
            ┌──────────────────────┐
            │  4. DELETE (Optional)│
            │  Click 🗑️ button     │
            │  File removed:       │
            │  - Database deleted  │
            │  - Disk file deleted │
            │  - Cache cleared     │
            └──────────────────────┘
```

---

## 📋 Step-by-Step for Demo

### Upload Document:
```
1. Click "Docs" tab
2. Click upload area (or drag & drop)
3. Select PDF/Word/PowerPoint file
4. Document appears in list
   ├── Name: Your-File.pdf
   ├── Type: PDF (shown in red)
   ├── Size: 175.1 KB
   └── Chunks: 0 (will process when used)
```

### Use Document for Chat:
```
1. Select document checkbox
2. Click "Chat with Selected (1)"
3. Send message about the document
4. AI responds using ONLY that document
```

### Delete Document:
```
1. Click 🗑️ delete button
2. Document is completely removed:
   ✓ Not in sidebar
   ✓ Not in database
   ✓ Not on disk
   ✓ AI cannot use it
```

---

## 🔧 Utilities & Maintenance

### Sync Script: `sync_documents.py`
**When to use:** Documents are on disk but not showing in UI

```powershell
python sync_documents.py
```

**What it does:**
- Finds documents on disk
- Adds to database if missing
- Removes orphaned database records
- Verifies sync is complete

---

### Clean Script: `clean_database.py`
**When to use:** Need complete reset (remove all documents)

```powershell
python clean_database.py
```

**What it does:**
- Removes all conversation data
- Keeps database schema
- Preserves files on disk
- Creates backup before cleaning

---

### Start Script: `Hackathon-Startup.ps1`
**When to use:** Bring entire system up with monitoring

```powershell
.\Hackathon-Startup.ps1 -Monitor
```

**What it does:**
- Starts backend
- Starts frontend
- Verifies Ollama
- Monitors all services continuously

---

## 🗂️ File Organization

```
Project Root
├── data/
│   ├── uploads/              ← Document files stored here
│   │   ├── .gitkeep
│   │   └── {id}_{filename}   ← File format
│   ├── vectordb/             ← Vector embeddings
│   ├── cache/                ← AI cache
│   └── conversations.db      ← Main database
├── backend/                  ← FastAPI server
├── frontend/                 ← Next.js UI
├── sync_documents.py         ← UTILITY: Sync disk↔DB
├── clean_database.py         ← UTILITY: Reset data
└── Hackathon-Startup.ps1    ← UTILITY: System start
```

---

## ⚠️ Troubleshooting

### Problem: Document uploaded but not showing
```
This should NOT happen with current fixes
If it does occur:
  1. python sync_documents.py
  2. Refresh browser
  3. Document should appear
```

### Problem: AI using deleted document
```
This should NOT happen with current fixes
If it does occur:
  1. Restart backend:
     cd backend && python -m uvicorn app.main:app --port 8000
  2. Refresh browser
  3. Document should be gone, AI error shown
```

### Problem: File exists on disk but not in database
```
Run sync utility:
  python sync_documents.py
```

### Problem: Database has orphaned records
```
Run sync utility (automatically removes):
  python sync_documents.py
```

---

## 📊 Current System State

### Verified ✅:
- [x] Document upload works
- [x] Documents show in UI
- [x] Documents persist after refresh
- [x] Delete removes from database
- [x] Delete removes from disk
- [x] AI can use documents
- [x] AI cannot use deleted docs
- [x] Sync script works
- [x] Multi-document support

### Database Schema:
```python
{
    "id": "unique-id",
    "filename": "file.pdf",
    "file_type": "pdf",
    "file_size": 179290,
    "chunks_created": 0,
    "total_pages": null,
    "upload_date": "2026-04-14T07:43:XX"
}
```

---

## 🚀 For Hackathon Demo

**You have everything you need:**
- ✅ Upload documents → Show in Docs tab
- ✅ Delete documents → Completely removed
- ✅ Use documents → AI responds with them
- ✅ Documents persist → Across refreshes & restarts
- ✅ Full sync → Database always matches disk state

**Demo Flow:**
```
1. Click Docs tab
   └─ Show: "Upload Study Materials" section
   
2. Upload a PDF/Word file
   └─ Show: File appears in list immediately
   
3. Select document
   └─ Show: Checkbox marks selection
   
4. Click "Chat with Selected"
   └─ Switch to Chat, send message
   └─ Show: AI responds using document
   
5. Switch back to Docs
   └─ Click delete (🗑️) button
   └─ Show: Document completely gone
   
6. Try to use deleted doc in chat
   └─ Show: Error "Document not found"
```

---

## ✅ System is Production-Ready

Your document management system now guarantees:
- ✅ Automatic sync between disk and database
- ✅ Complete cleanup on delete
- ✅ AI cannot access deleted documents
- ✅ Documents persist across restarts
- ✅ Multiple documents supported
- ✅ Easy troubleshooting with sync utilities

**Ready for hackathon!** 🎉
