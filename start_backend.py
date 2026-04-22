#!/usr/bin/env python3
"""
Start ZenForge Backend Server
"""
import subprocess
import sys
import os
from pathlib import Path

def main():
    print("🚀 Starting ZenForge Backend Server...")
    print("=" * 50)
    
    # Ensure we're in the right directory
    backend_dir = Path(__file__).parent / "backend"
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return 1
    
    # Change to backend directory
    os.chdir(backend_dir)
    print(f"📁 Working directory: {os.getcwd()}")
    
    # Check if venv exists
    venv_path = Path(".venv_win")
    if (venv_path / "bin" / "python.exe").exists():
        python_exe = venv_path / "bin" / "python.exe"
    elif (venv_path / "Scripts" / "python.exe").exists():
        python_exe = venv_path / "Scripts" / "python.exe"
    elif (venv_path / "bin" / "python").exists():
        python_exe = venv_path / "bin" / "python"
    else:
        python_exe = sys.executable
    
    
    print("🔧 Starting FastAPI server...")
    print("   Host: 0.0.0.0")
    print("   Port: 8001") 
    print("   Reload: enabled")
    print()
    print("📊 Server will be available at:")
    print("   🌐 API: http://localhost:8001")
    print("   📖 Docs: http://localhost:8001/docs")
    print()
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        # Start uvicorn
        subprocess.run([
            str(python_exe),
            "-m", "uvicorn",
            "app.main:app",
            "--host", "0.0.0.0",
            "--port", "8001",
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        return 0
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())