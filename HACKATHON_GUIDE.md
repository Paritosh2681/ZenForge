# 🚀 ZENFORGE HACKATHON QUICK START & TROUBLESHOOTING GUIDE

## ⚡ QUICK START (5 minutes)

### Option A: Automatic Startup (RECOMMENDED)
```powershell
# Navigate to project root
cd d:\Hackethon\AMD\ZenForge

# Run with automatic health monitoring
.\Hackathon-Startup.ps1 -Monitor

# Or just start without monitoring
.\Hackathon-Startup.ps1
```

### Option B: Manual Startup
In separate terminal windows:

**Terminal 1 - Backend:**
```powershell
cd d:\Hackethon\AMD\ZenForge\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```powershell
cd d:\Hackethon\AMD\ZenForge\frontend
npm run dev
```

**Terminal 3 - Ollama (if not running):**
```powershell
ollama serve
```

Then open: **http://localhost:3000/dashboard**

---

## 🔍 HEALTH CHECK

### Check System Status:
```powershell
# Backend health
curl http://localhost:8000/api/v1/health

# Frontend alive
curl http://localhost:3000

# Ollama status
curl http://localhost:11434/api/tags
```

### Expected Responses:
- ✅ Backend: `{"status":"ok","message":"API is running"}`
- ✅ Frontend: HTML response (200 OK)
- ✅ Ollama: `{"models":[...]}`

---

## 🐛 TROUBLESHOOTING

### Issue 1: Conversations Not Loading ("Loading conversations...")

**Symptoms:**
- Left sidebar shows "Loading conversations..." forever
- Chat window is empty

**Solutions (in order):**

1. **Refresh Browser:**
   ```
   Press Ctrl+R or Cmd+R to hard refresh
   Or Ctrl+Shift+R for cache clear refresh
   ```

2. **Restart Backend (if refresh doesn't work):**
   ```powershell
   # Kill the backend process
   Get-Process -Name python | Where-Object {$_.CommandLine -like "*8000*"} | Stop-Process -Force
   
   # Restart it
   cd d:\Hackethon\AMD\ZenForge\backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. **Reset Database (if corrupted):**
   ```powershell
   # Backup current database
   Copy-Item d:\Hackethon\AMD\ZenForge\data\conversations.db `
     d:\Hackethon\AMD\ZenForge\data\conversations.db.backup
   
   # Remove WAL files (write-ahead log)
   Remove-Item d:\Hackethon\AMD\ZenForge\data\conversations.db-shm
   Remove-Item d:\Hackethon\AMD\ZenForge\data\conversations.db-wal
   
   # Restart backend
   ```

---

### Issue 2: AI Not Responding / "Ollama Error"

**Symptoms:**
- Chat shows 3 dots forever
- Error message about Ollama not available
- Messages say "fallback response"

**Solutions:**

1. **Check Ollama is Running:**
   ```powershell
   Get-Process -Name "ollama" | Select-Object ProcessName, Id
   ```

2. **Restart Ollama:**
   ```powershell
   # Kill it
   Get-Process -Name "ollama" -ErrorAction SilentlyContinue | Stop-Process -Force
   
   # Start it
   ollama serve
   
   # Wait 5 seconds, then verify
   Start-Sleep -Seconds 5
   curl http://localhost:11434/api/tags
   ```

3. **Verify Model is Installed:**
   ```powershell
   ollama list
   # Should show: mistral:7b
   ```

4. **If Model Missing, Install It:**
   ```powershell
   ollama pull mistral:7b
   # Wait for download (4.3 GB, ~5-10 mins depending on connection)
   ```

---

### Issue 3: Frontend Page Blank / Shows 404

**Symptoms:**
- Frontend shows error page or blank
- Cannot access http://localhost:3000

**Solutions:**

1. **Check Frontend is Running:**
   ```powershell
   Get-Process -Name "node" | Select-Object ProcessName, Id
   ```

2. **Kill and Restart Frontend:**
   ```powershell
   Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
   
   cd d:\Hackethon\AMD\ZenForge\frontend
   npm run dev
   
   # Wait 10-15 seconds for build
   ```

3. **Clear Next.js Cache:**
   ```powershell
   # Remove build cache
   Remove-Item d:\Hackethon\AMD\ZenForge\frontend\.next -Recurse -Force
   Remove-Item d:\Hackethon\AMD\ZenForge\frontend\node_modules\.next -Recurse -Force -ErrorAction SilentlyContinue
   
   # Restart frontend
   cd d:\Hackethon\AMD\ZenForge\frontend
   npm run dev
   ```

---

### Issue 4: Backend Timeout / Service Stops Responding

**Symptoms:**
- curl commands timeout
- Backend says listening but doesn't respond
- Takes forever to load anything

**Quick Fix:**
```powershell
# Restart backend immediately
Get-Process -Name python | Stop-Process -Force -ErrorAction SilentlyContinue
cd d:\Hackethon\AMD\ZenForge\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Permanent Fix:**
Use the monitoring startup script:
```powershell
.\Hackathon-Startup.ps1 -Monitor
# This auto-restarts backend if it fails
```

---

### Issue 5: Port Already in Use

**Error:** `Address already in use` for port 8000, 3000, or 11434

**Solutions:**

1. **Find and Kill Process Using Port:**
   ```powershell
   # For port 8000
   $pid = (Get-NetTCPConnection -LocalPort 8000).OwningProcess
   Stop-Process -Id $pid -Force
   
   # For port 3000
   $pid = (Get-NetTCPConnection -LocalPort 3000).OwningProcess
   Stop-Process -Id $pid -Force
   
   # For port 11434
   $pid = (Get-NetTCPConnection -LocalPort 11434).OwningProcess
   Stop-Process -Id $pid -Force
   ```

2. **Or Use Cleanup Script:**
   ```powershell
   .\cleanup.bat
   ```

---

## ⚙️ PERFORMANCE OPTIMIZATION

### AI Responses Are Slow?

The system is optimized for speed. If still slow:

1. **Check Backend Logs:**
   - Look at the terminal running backend for errors
   - Search for "error", "timeout", "exception"

2. **Monitor Active Connections:**
   ```powershell
   # Check database locks
   netstat -ano | Select-String "8000|3000"
   ```

3. **Restart Everything Fresh:**
   ```powershell
   # Run cleanup and restart
   Get-Process -Name python, node -ErrorAction SilentlyContinue | Stop-Process -Force
   Start-Sleep -Seconds 2
   .\Hackathon-Startup.ps1 -Monitor
   ```

---

## 📊 MONITORING THE SYSTEM

### Real-time Health Monitoring:
```powershell
# Run startup script with continuous monitoring
.\Hackathon-Startup.ps1 -Monitor

# This will:
# - Check backend health every 10 seconds
# - Check frontend health every 10 seconds
# - Auto-restart any failed services
# - Show status in real-time
```

### Check Logs:
```powershell
# Backend logs (in backend terminal)
# Look for: ERROR, EXCEPTION, Timeout

# Frontend logs (in frontend terminal)
# Look for: error, Exception, fetch failed

# Ollama logs (in ollama terminal)
# Look for: error, failed, timeout
```

---

## 🎬 DEMO CHECKLIST

Before Demo:
- [ ] Run `.\Hackathon-Startup.ps1 -Monitor` in one terminal
- [ ] Wait for all services to start (watch for ✓ marks)
- [ ] Open http://localhost:3000/dashboard in browser
- [ ] Verify conversations load in left sidebar (or show "No conversations yet" if fresh)
- [ ] Send test message: "Hello" to verify AI responds
- [ ] **Check sidebar updates with new conversation** (this proves auto-save works!)
- [ ] If any step fails, use troubleshooting above

Quick Demo Flow:
1. **Show conversation auto-save in action:**
   - Send message "Explain this concept..."
   - Watch it appear in sidebar automatically
   - Show message counter increasing
   - Click back to it - full history preserved
   
2. **Demonstrate persistence:**
   - Create 2-3 test conversations
   - Restart browser (Ctrl+R)
   - Show: "All conversations still there!"
   
3. **Show conversation sources:**
   - AI response with document sources
   - Message with auto-generated summary
   
4. Upload a document (if applicable)

5. Generate a quiz

6. Show stats/analytics

**Key Talking Points:**
- "Every message automatically saves"
- "Conversation history persists across restarts"
- "Full message history always available"
- "No manual save needed - it's automatic!"

---

## 🆘 EMERGENCY RECOVERY

**Nuclear Option - Complete System Reset:**
```powershell
# Option 1: Clean database only (remove all conversations, keep system running)
python clean_database.py

# Option 2: Kill everything and reset
Get-Process -Name python, node, ollama -ErrorAction SilentlyContinue | Stop-Process -Force
python clean_database.py
.\Hackathon-Startup.ps1 -Monitor
```

**If Still Broken:**
```powershell
# Check for port conflicts
netstat -ano | Select-String ":8000|:3000|:11434"

# Verify Python/Node/Ollama are installed
python --version
node --version
ollama --version

# If any missing, install before restarting
```

---

## 📞 QUICK REFERENCE

| Service | Port | Health URL | Start Command |
|---------|------|-----------|---|
| Backend (FastAPI) | 8000 | http://localhost:8000/api/v1/health | `cd backend && uvicorn app.main:app --port 8000` |
| Frontend (Next.js) | 3000 | http://localhost:3000 | `cd frontend && npm run dev` |
| Ollama (LLM) | 11434 | http://localhost:11434/api/tags | `ollama serve` |

---

## 🚨 SOS: CODE TO RUN IF EVERYTHING BREAKS

```powershell
# Paste this entire block and run it
$ErrorActionPreference = "SilentlyContinue"

# Kill all services
Get-Process python, node, ollama | Stop-Process -Force
Start-Sleep -Seconds 2

# Clean database WAL files
Remove-Item d:\Hackethon\AMD\ZenForge\data\conversations.db-shm
Remove-Item d:\Hackethon\AMD\ZenForge\data\conversations.db-wal

# Clear frontend cache
Remove-Item d:\Hackethon\AMD\ZenForge\frontend\.next -Recurse -Force

# Start monitoring version
cd d:\Hackethon\AMD\ZenForge
.\Hackathon-Startup.ps1 -Monitor

# Open browser
Start-Process "http://localhost:3000/dashboard"
```

After you run this ^ , wait 30 seconds and everything should be working.

---

## 💡 TIPS FOR HACKATHON DEMO

1. **Pre-load a conversation:** Having demo data ready makes the presentation smoother
2. **Have documents uploaded:** Demos work better with existing documents to query
3. **Test everything 5 minutes before:** Connection issues are common on demo day
4. **Know your fallback:** If internet/services fail, show pre-recorded demo or screenshots
5. **Keep this guide handy:** Print or have open on extra monitor for quick troubleshooting

Good luck with the hackathon! 🚀
