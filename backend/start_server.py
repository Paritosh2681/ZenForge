#!/usr/bin/env python3
"""
Start the FastAPI backend server for ZenForge
"""
import subprocess
import sys
import os

# Change to backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("=" * 60)
print("ZenForge FastAPI Backend Startup")
print("=" * 60)

# Step 1: Check Python and pip
print("\n[1/3] Checking Python and pip...")
try:
    result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True, check=True)
    print(f"✓ Python: {result.stdout.strip()}")
except Exception as e:
    print(f"✗ Error checking Python: {e}")
    sys.exit(1)

try:
    result = subprocess.run([sys.executable, "-m", "pip", "--version"], capture_output=True, text=True, check=True)
    print(f"✓ Pip: {result.stdout.strip()}")
except Exception as e:
    print(f"✗ Error checking pip: {e}")
    sys.exit(1)

# Step 2: Install requirements
print("\n[2/3] Installing requirements...")
try:
    result = subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                          capture_output=True, text=True, timeout=300)
    if result.returncode == 0:
        print("✓ Requirements installed successfully")
    else:
        print(f"✗ Failed to install requirements:\n{result.stderr}")
        sys.exit(1)
except subprocess.TimeoutExpired:
    print("✗ Installation timed out (took too long)")
    sys.exit(1)
except Exception as e:
    print(f"✗ Error installing requirements: {e}")
    sys.exit(1)

# Step 3: Start the server
print("\n[3/3] Starting FastAPI backend server...")
print("=" * 60)
print("Backend Server Running:")
print("  URL: http://localhost:8000")
print("  API Docs: http://localhost:8000/docs")
print("  ReDoc: http://localhost:8000/redoc")
print("=" * 60)

try:
    subprocess.run([
        sys.executable, "-m", "uvicorn", 
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ])
except KeyboardInterrupt:
    print("\n✓ Server stopped")
except Exception as e:
    print(f"✗ Error starting server: {e}")
    sys.exit(1)
