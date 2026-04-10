import subprocess
import sys
import time
import webbrowser
from pathlib import Path

print("=" * 60)
print("ZenForge Offline Mode - Starting Services...")
print("100% Local | 100% Private")
print("=" * 60)

# Start backend
print("\n[1/2] Starting Backend API Server...")
backend_process = subprocess.Popen([
    '.venv/bin/python.exe',
    '-m', 'uvicorn', 
    'app.main:app',
    '--host', '0.0.0.0',
    '--port', '8001',
    '--reload'
], cwd='backend')

print(f"Backend started (PID: {backend_process.pid})")
print("API: http://localhost:8001")
print("Docs: http://localhost:8001/docs")

# Wait for backend
print("Waiting for backend to initialize...")
time.sleep(6)

# Start frontend  
print("\n[2/2] Starting Frontend Web Server...")
frontend_process = subprocess.Popen([
    'npm', 'run', 'dev'
], cwd='frontend')

print(f"Frontend started (PID: {frontend_process.pid})")
print("App: http://localhost:3000")
print("Dashboard: http://localhost:3000/dashboard")

# Wait for frontend
print("Waiting for frontend to initialize...")
time.sleep(10)

print("\n" + "=" * 60)
print("ZENFORGE IS NOW RUNNING OFFLINE!")
print("=" * 60)

print("\nOFFLINE FEATURES READY:")
print("- Document processing & RAG (PDF, DOCX, PPTX)")
print("- AI Chat with Ollama (llama3.2:latest)")
print("- Adaptive Quiz System")
print("- Code Execution Sandbox")
print("- Podcast Generation")
print("- Study Planner")
print("- Achievement Badges")
print("- Focus monitoring")
print("- Local analytics")

print("\nPRIVACY GUARANTEE:")
print("- 100% local processing")
print("- No data ever leaves your machine")
print("- Complete offline operation")

print(f"\nURLs:")
print(f"Dashboard: http://localhost:3000/dashboard")
print(f"API Docs:  http://localhost:8001/docs")

# Open dashboard
print("\nOpening dashboard in browser...")
time.sleep(2)
webbrowser.open("http://localhost:3000/dashboard")

print("\n" + "=" * 60)
print("SYSTEM STATUS:")
print(f"Backend PID: {backend_process.pid}")
print(f"Frontend PID: {frontend_process.pid}")
print("\nTo stop ZenForge:")
print("- Close this window OR press Ctrl+C")
print("=" * 60)

# Keep running
try:
    print("\nServices running... Press Ctrl+C to stop")
    while True:
        time.sleep(1)
        if backend_process.poll() is not None:
            print("Backend ended unexpectedly")
            break
        if frontend_process.poll() is not None:
            print("Frontend ended unexpectedly") 
            break
            
except KeyboardInterrupt:
    print("\nStopping ZenForge services...")
    
    try:
        backend_process.terminate()
        frontend_process.terminate()
        
        backend_process.wait(timeout=5)
        frontend_process.wait(timeout=5)
        print("Services stopped gracefully")
    except:
        print("Forcing process termination...")
        backend_process.kill()
        frontend_process.kill()
        
    print("ZenForge offline session ended")