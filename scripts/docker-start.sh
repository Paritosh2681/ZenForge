#!/bin/bash

# Guru-Agent Docker Startup Script (Linux/Mac)

set -e

echo "=========================================="
echo "Guru-Agent - Docker Setup"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed."
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not installed."
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if Ollama is running on host
echo "Checking if Ollama is running on host..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✓ Ollama detected on host (localhost:11434)"
    echo "Using docker-compose.yml (connects to host Ollama)"
    COMPOSE_FILE="docker-compose.yml"
else
    echo "⚠ Ollama not detected on host"
    echo "Using docker-compose.full.yml (includes Ollama in Docker)"
    COMPOSE_FILE="docker-compose.full.yml"
fi

echo ""
echo "Building and starting containers..."
echo ""

# Build and start
docker-compose -f $COMPOSE_FILE up --build -d

echo ""
echo "=========================================="
echo "Guru-Agent Started! "
echo "=========================================="
echo ""
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8000"
echo "API Docs:  http://localhost:8000/docs"
echo ""

if [ "$COMPOSE_FILE" = "docker-compose.full.yml" ]; then
    echo "⏳ Pulling Mistral model (first time only, ~4.4GB)..."
    echo "   This may take a few minutes..."
    echo ""
    docker exec guru-agent-ollama ollama pull mistral:7b
    echo ""
    echo "✓ Mistral model ready!"
fi

echo ""
echo "View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "Stop:      docker-compose -f $COMPOSE_FILE down"
echo ""
echo "=========================================="
