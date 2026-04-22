#!/usr/bin/env python3
"""
ZenForge Offline Launcher
Start both backend and frontend services
"""
import subprocess
import sys
import time
import webbrowser
from pathlib import Path

def main():
    print()
    print("  ╔══════════════════════════════════════════════════════════════╗")
    print("  ║                   ZenForge Offline Mode                      ║")
    print("  ║               🏠 100% Local  |  🔒 100% Private              ║")
    print("  ║                    Starting Services...                     ║")
    print("  ╚══════════════════════════════════════════════════════════════╝")
    print()
    
    # Check if we're in the right directory
    if not Path("backend").exists() or not Path("frontend").exists():
        print("❌ Please run this script from the ZenForge root directory")
        return 1
    
    print("🚀 STARTING ZENFORGE OFFLINE SYSTEM")
    print("=" * 60)
    
    try:
        # Start backend in background
        print("📦 [1/2] Starting Backend API Server...")
        backend_process = subprocess.Popen([
            sys.executable, "start_backend.py"
        ])
        print(f"   ✅ Backend started (PID: {backend_process.pid})")
        print("   🌐 API: http://localhost:8001")
        print("   📖 Docs: http://localhost:8001/docs")
        
        # Wait a moment for backend to initialize
        print("   ⏳ Waiting for backend to initialize...")
        time.sleep(5)
        
        # Start frontend in background  
        print("\n🌐 [2/2] Starting Frontend Web Server...")
        frontend_process = subprocess.Popen([
            sys.executable, "start_frontend.py"
        ])
        print(f"   ✅ Frontend started (PID: {frontend_process.pid})")
        print("   🌐 App: http://localhost:3000")
        print("   📊 Dashboard: http://localhost:3000/dashboard")
        
        # Wait for frontend to start
        print("   ⏳ Waiting for frontend to initialize...")
        time.sleep(8)
        
        print("\n" + "=" * 60)
        print("🎉 ZENFORGE IS NOW RUNNING OFFLINE!")
        print("=" * 60)
        
        print("\n✅ OFFLINE FEATURES READY:")
        print("   📄 Document processing & RAG (PDF, DOCX, PPTX)")
        print("   🤖 AI Chat with Ollama (llama3.2:latest)")
        print("   📝 Adaptive Quiz System with spaced repetition")
        print("   💻 Code Execution Sandbox")
        print("   🎵 Podcast Generation from documents")
        print("   👨‍🎓 Protégé Teaching System") 
        print("   📅 Study Planner with intelligent scheduling")
        print("   🏆 Achievement Badges and progress tracking")
        print("   📱 Focus monitoring with camera analysis")
        print("   📊 All analytics stored locally")
        
        print("\n🔒 PRIVACY GUARANTEE:")
        print("   ✅ 100% local processing")
        print("   ✅ No data ever leaves your machine")
        print("   ✅ Complete offline operation")
        
        print(f"\n🌐 URLS:")
        print(f"   Dashboard: http://localhost:3000/dashboard")
        print(f"   API Docs:  http://localhost:8001/docs")
        
        # Open dashboard in browser
        print("\n🚀 Opening dashboard in your default browser...")
        time.sleep(2)
        webbrowser.open("http://localhost:3000/dashboard")
        
        print("\n" + "=" * 60)
        print("ℹ️  SYSTEM STATUS:")
        print(f"   Backend PID: {backend_process.pid}")
        print(f"   Frontend PID: {frontend_process.pid}")
        print("\n   🛑 To stop ZenForge:")
        print("      - Close this window OR press Ctrl+C")
        print("      - Or terminate the backend/frontend processes manually")
        print("=" * 60)
        
        # Keep running until user interrupts
        try:
            print("\n⏳ Services running... Press Ctrl+C to stop")
            while True:
                time.sleep(1)
                # Check if processes are still alive
                if backend_process.poll() is not None:
                    print("⚠️ Backend process ended unexpectedly")
                    break
                if frontend_process.poll() is not None:
                    print("⚠️ Frontend process ended unexpectedly") 
                    break
                    
        except KeyboardInterrupt:
            print("\n🛑 Stopping ZenForge services...")
            
            # Terminate processes
            try:
                backend_process.terminate()
                frontend_process.terminate()
                
                # Wait for graceful shutdown
                backend_process.wait(timeout=5)
                frontend_process.wait(timeout=5)
                print("✅ Services stopped gracefully")
            except subprocess.TimeoutExpired:
                print("⚠️ Forcing process termination...")
                backend_process.kill()
                frontend_process.kill()
                
            print("👋 ZenForge offline session ended")
            return 0
            
    except Exception as e:
        print(f"❌ Error starting ZenForge: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())