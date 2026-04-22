#!/usr/bin/env python3
"""
Install missing ZenForge backend dependencies
Run this if the backend fails to start due to missing packages
"""
import subprocess
import sys

def install_package(package_name):
    """Install a Python package using pip"""
    print(f"Installing {package_name}...")
    try:
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', package_name
        ], check=True, capture_output=True, text=True)
        print(f"✓ {package_name} installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install {package_name}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("=" * 60)
    print("ZenForge Backend Dependencies Installer")
    print("=" * 60)
    
    # Required packages for ZenForge backend
    required_packages = [
        'tiktoken',              # Token counting and text processing
        'chromadb',              # Vector database for RAG
        'sentence-transformers', # Text embeddings
        'aiosqlite',            # Async SQLite support
        'python-multipart',     # File upload support
        'python-dotenv',        # Environment variables
    ]
    
    print(f"Installing {len(required_packages)} required packages...\n")
    
    success_count = 0
    for package in required_packages:
        if install_package(package):
            success_count += 1
        print()
    
    print("=" * 60)
    print(f"Installation Summary: {success_count}/{len(required_packages)} packages installed")
    print("=" * 60)
    
    if success_count == len(required_packages):
        print("✓ All dependencies installed successfully!")
        print("✓ Backend should now start without errors")
        print("\nRestart the backend server:")
        print("  cd backend")
        print("  python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload")
    else:
        print("⚠ Some packages failed to install")
        print("⚠ Backend may still have startup issues")
        print("\nTry installing failed packages manually:")
        for package in required_packages:
            print(f"  pip install {package}")

if __name__ == "__main__":
    main()