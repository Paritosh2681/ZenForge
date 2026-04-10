#!/usr/bin/env python3
"""
Cache Embedding Model for Offline Operation

This script downloads and caches the sentence-transformers embedding model
needed for document processing and RAG functionality.
"""

import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    from app.config import settings
except ImportError as e:
    print(f"❌ Could not import settings: {e}")
    print("💡 Make sure you're running from the ZenForge root directory")
    sys.exit(1)

def cache_embedding_model():
    """Download and cache the embedding model for offline use."""
    print("🔄 Caching embedding model for offline operation...")
    
    try:
        from sentence_transformers import SentenceTransformer
        
        # Ensure cache directory exists
        cache_path = settings.CACHE_DIR / "sentence_transformers"
        cache_path.mkdir(parents=True, exist_ok=True)
        
        print(f"📂 Cache directory: {cache_path}")
        print(f"🤖 Model: {settings.EMBEDDING_MODEL}")
        
        # Download and cache model (this will download if not cached)
        print("⬇️  Downloading embedding model (one-time setup)...")
        model = SentenceTransformer(
            settings.EMBEDDING_MODEL,
            cache_folder=str(cache_path),
            local_files_only=False  # Allow download
        )
        
        # Test the model
        print("🧪 Testing embedding model...")
        test_text = "This is a test sentence for embedding."
        embedding = model.encode([test_text])
        print(f"✅ Model working! Embedding dimension: {embedding.shape}")
        
        print("✅ Embedding model successfully cached for offline use!")
        print(f"📍 Location: {cache_path}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("💡 Make sure sentence-transformers is installed in your virtual environment:")
        
        # Check if we're in a virtual environment
        venv_path = Path(__file__).parent / "backend" / ".venv"
        if venv_path.exists():
            if os.name == 'nt':  # Windows
                pip_path = venv_path / "Scripts" / "python.exe"
                print(f"   {pip_path} -m pip install sentence-transformers")
            else:  # Unix
                pip_path = venv_path / "bin" / "python"
                print(f"   {pip_path} -m pip install sentence-transformers")
        else:
            print("   pip install sentence-transformers")
            
        return False
        
    except Exception as e:
        print(f"❌ Error caching model: {e}")
        return False

def test_offline_mode():
    """Test if the model works in offline mode."""
    print("\n🔒 Testing offline mode...")
    
    try:
        from sentence_transformers import SentenceTransformer
        
        cache_path = settings.CACHE_DIR / "sentence_transformers"
        
        # Try to load model in offline mode
        model = SentenceTransformer(
            settings.EMBEDDING_MODEL,
            cache_folder=str(cache_path),
            local_files_only=True  # Offline only
        )
        
        # Test embedding generation
        test_text = "Offline embedding test successful!"
        embedding = model.encode([test_text])
        
        print(f"✅ Offline mode working! Model ready for document processing.")
        return True
        
    except Exception as e:
        print(f"❌ Offline mode failed: {e}")
        print("💡 Try running with internet connection first to cache the model")
        return False

if __name__ == "__main__":
    print("🚀 ZenForge Embedding Model Caching Tool")
    print("=" * 50)
    
    # Check if already cached
    try:
        cache_path = settings.CACHE_DIR / "sentence_transformers"
        model_path = cache_path / settings.EMBEDDING_MODEL.replace('/', '--')
        
        if model_path.exists():
            print("📦 Model already cached, testing offline mode...")
            if test_offline_mode():
                print("\n🎉 System ready for offline document processing!")
                sys.exit(0)
            else:
                print("\n🔄 Re-caching model...")
    except Exception as e:
        print(f"⚠️  Could not check cache status: {e}")
    
    # Cache the model
    if cache_embedding_model():
        print("\n🔒 Testing offline functionality...")
        if test_offline_mode():
            print("\n🎉 Setup complete! Document upload should work offline now.")
        else:
            print("\n⚠️  Model cached but offline test failed. Check configuration.")
    else:
        print("\n❌ Failed to cache embedding model. Document upload may not work offline.")
        sys.exit(1)