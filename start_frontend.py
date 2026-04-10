#!/usr/bin/env python3
"""
Start ZenForge Frontend Server
"""
import subprocess
import sys
import os
from pathlib import Path

def main():
    print("🚀 Starting ZenForge Frontend Server...")
    print("=" * 50)
    
    # Ensure we're in the right directory
    frontend_dir = Path(__file__).parent / "frontend"
    if not frontend_dir.exists():
        print("❌ Frontend directory not found!")
        return 1
    
    # Change to frontend directory
    os.chdir(frontend_dir)
    print(f"📁 Working directory: {os.getcwd()}")
    
    # Check if node_modules exists
    if not (Path("node_modules").exists()):
        print("⚠️ node_modules not found, installing dependencies...")
        try:
            subprocess.run(["npm", "install"], check=True)
            print("✅ Dependencies installed")
        except subprocess.CalledProcessError:
            print("❌ Failed to install dependencies")
            return 1
    
    print("🔧 Starting Next.js development server...")
    print("   Host: localhost")
    print("   Port: 3000") 
    print()
    print("📊 Frontend will be available at:")
    print("   🌐 App: http://localhost:3000")
    print("   📊 Dashboard: http://localhost:3000/dashboard")
    print()
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        # Start npm dev
        subprocess.run(["npm", "run", "dev"])
    except KeyboardInterrupt:
        print("\n🛑 Frontend server stopped by user")
        return 0
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())