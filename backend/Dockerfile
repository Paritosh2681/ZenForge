# Backend Dockerfile - Full RAG System + Phase 2 Multimodal
FROM python:3.11-slim

# Install system dependencies for compilation + Phase 2 (OpenCV, ffmpeg)
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    curl \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first (for caching)
COPY requirements.txt requirements-phase2.txt ./

# Install Python dependencies (Phase 1 required, Phase 2 optional)
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt && \
    (pip install --no-cache-dir -r requirements-phase2.txt 2>&1 | tee /tmp/phase2-install.log || echo "Phase 2 multimodal dependencies skipped - Phase 4 will work without them")

# Copy application code
COPY app/ ./app/
COPY .env.example .env

# Create data directories
RUN mkdir -p /app/data/uploads /app/data/vectordb /app/data/cache

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
