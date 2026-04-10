#!/usr/bin/env python3
"""
ZenForge Offline Model Downloader
Downloads and caches required models for offline operation
"""

import os
import sys
import subprocess
import requests
from pathlib import Path
import json

def check_internet():
    """Check if internet connection is available"""
    try:
        requests.get('https://httpbin.org/get', timeout=5)
        return True
    except:
        return False

def download_embedding_models():
    """Download sentence-transformers models for offline use"""
    print("📥 Downloading embedding models...")
    
    try:
        from sentence_transformers import SentenceTransformer
        
        # Download and cache the embedding model
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Embedding model downloaded and cached")
        return True
    except Exception as e:
        print(f"❌ Failed to download embedding model: {e}")
        return False

def check_ollama():
    """Check if Ollama is installed and running"""
    try:
        # Check if ollama command exists
        result = subprocess.run(['ollama', '--version'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ Ollama is installed")
            return True
    except FileNotFoundError:
        print("❌ Ollama not found. Install from https://ollama.ai/download")
        return False
    
    return False

def start_ollama():
    """Start Ollama service"""
    try:
        print("🚀 Starting Ollama service...")
        # Start ollama serve in background
        if sys.platform == "win32":
            subprocess.Popen(['ollama', 'serve'], 
                           creationflags=subprocess.CREATE_NEW_CONSOLE)
        else:
            subprocess.Popen(['ollama', 'serve'], 
                           stdout=subprocess.DEVNULL, 
                           stderr=subprocess.DEVNULL)
        
        # Wait a bit for service to start
        import time
        time.sleep(3)
        return True
    except Exception as e:
        print(f"❌ Failed to start Ollama: {e}")
        return False

def check_ollama_models():
    """Check what models are available"""
    try:
        result = subprocess.run(['ollama', 'list'], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            models = result.stdout
            print("📋 Available Ollama models:")
            print(models)
            
            # Check for common models
            if 'llama3.2' in models:
                return 'llama3.2:latest'
            elif 'mistral' in models:
                return 'mistral:7b'
            elif 'qwen' in models:
                return 'qwen2.5:3b'
            else:
                return None
    except Exception as e:
        print(f"❌ Failed to check models: {e}")
        return None

def download_model(model_name):
    """Download specified Ollama model"""
    try:
        print(f"📥 Downloading {model_name} (this may take 10-15 minutes)...")
        result = subprocess.run(['ollama', 'pull', model_name], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {model_name} downloaded successfully!")
            return True
        else:
            print(f"❌ Failed to download {model_name}: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error downloading {model_name}: {e}")
        return False

def update_config_for_offline(model_name=None):
    """Update ZenForge configuration for offline mode"""
    print("🔧 Updating configuration for offline mode...")
    
    config_path = Path(__file__).parent / "backend" / "app" / "config.py"
    
    try:
        with open(config_path, 'r') as f:
            content = f.read()
        
        # Update offline settings
        content = content.replace(
            'OFFLINE_MODE: bool = False', 
            'OFFLINE_MODE: bool = True'
        )
        content = content.replace(
            'LOCAL_MODEL_ONLY: bool = False', 
            'LOCAL_MODEL_ONLY: bool = True'
        )
        
        # Update model name if provided
        if model_name:
            import re
            content = re.sub(
                r'OLLAMA_MODEL: str = "[^"]*"',
                f'OLLAMA_MODEL: str = "{model_name}"',
                content
            )
        
        with open(config_path, 'w') as f:
            f.write(content)
        
        print("✅ Configuration updated for offline mode")
        return True
    except Exception as e:
        print(f"❌ Failed to update config: {e}")
        return False

def main():
    print("🚀 ZenForge Offline Setup")
    print("=" * 50)
    
    # Check internet connection
    if not check_internet():
        print("❌ No internet connection. Some models may not download.")
        print("   You can run this script again when online.")
    
    # Download embedding models
    print("\n📥 Setting up embedding models...")
    if check_internet():
        download_embedding_models()
    else:
        print("⚠️  Skipping embedding download - no internet")
    
    # Check Ollama
    print("\n🤖 Setting up local LLM...")
    if not check_ollama():
        print("\n📥 To complete offline setup:")
        print("1. Install Ollama from: https://ollama.ai/download")
        print("2. Run: ollama pull llama3.2:latest")
        print("3. Re-run this script")
        model_name = None
    else:
        start_ollama()
        
        # Check existing models
        existing_model = check_ollama_models()
        
        if existing_model:
            print(f"✅ Using existing model: {existing_model}")
            model_name = existing_model
        elif check_internet():
            # Try to download a model
            models_to_try = [
                'llama3.2:latest',  # Best quality
                'mistral:7b',       # Good alternative
                'qwen2.5:3b'        # Fastest
            ]
            
            model_name = None
            for model in models_to_try:
                if download_model(model):
                    model_name = model
                    break
            
            if not model_name:
                print("❌ Failed to download any models")
        else:
            print("⚠️  No models available and no internet connection")
            model_name = None
    
    # Update configuration
    print("\n⚙️  Updating system configuration...")
    update_config_for_offline(model_name)
    
    # Summary
    print("\n" + "=" * 50)
    print("🎉 OFFLINE SETUP COMPLETE!")
    print("=" * 50)
    
    print("\n✅ OFFLINE FEATURES READY:")
    print("   📄 Document processing (PDF, DOCX, PPTX)")
    print("   🔍 Vector search and RAG")
    print("   📱 Camera attention monitoring") 
    print("   🎵 Voice input/output (browser)")
    print("   💻 Code execution sandbox")
    print("   📊 Learning analytics")
    
    if model_name:
        print(f"   🤖 AI Chat ({model_name})")
        print("\n🚀 RUN: Start-GuruCortex.bat to launch!")
    else:
        print("   ⚠️  AI Chat (limited - install Ollama + model)")
        print("\n🔧 TO ENABLE AI CHAT:")
        print("   1. Install Ollama: https://ollama.ai/download")
        print("   2. Run: ollama pull llama3.2:latest")
        print("   3. Run: Start-GuruCortex.bat")
    
    print("\n💾 PRIVACY: 100% local - no data leaves your machine!")

if __name__ == "__main__":
    main()