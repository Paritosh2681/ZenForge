#!/bin/bash
# ZenForge Startup Script

echo "================================"
echo "ZenForge - Starting Services"
echo "================================"
echo ""

# Check if Ollama is running
echo "[1/5] Checking Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "  ✓ Ollama is running"
    echo "  Models available:"
    curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | sed 's/"name":"/  - /g' | sed 's/"//g'
else
    echo "  ✗ Ollama is not running!"
    echo "  Please start Ollama first"
    exit 1
fi

echo ""
echo "[2/5] Checking Docker..."
if docker --version > /dev/null 2>&1; then
    echo "  ✓ Docker is installed"
else
    echo "  ✗ Docker is not installed!"
    exit 1
fi

echo ""
echo "[3/5] Creating data directories..."
mkdir -p data/uploads data/vectordb data/cache
echo "  ✓ Data directories created"

echo ""
echo "[4/5] Starting Docker containers..."
docker-compose down --remove-orphans
docker-compose up -d --build

echo ""
echo "[5/5] Waiting for services to be healthy..."
sleep 10

# Check backend
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "  ✓ Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "  ✗ Backend failed to start"
        docker-compose logs backend | tail -20
        exit 1
    fi
    sleep 2
    echo "  Waiting for backend... ($i/30)"
done

# Check frontend
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "  ✓ Frontend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "  ✗ Frontend failed to start"
        docker-compose logs frontend | tail -20
        exit 1
    fi
    sleep 2
    echo "  Waiting for frontend... ($i/30)"
done

echo ""
echo "================================"
echo "✓ ZenForge is ready!"
echo "================================"
echo ""
echo "Access the application:"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo ""
echo "View logs:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f frontend"
echo ""
echo "Stop services:"
echo "  docker-compose down"
echo ""
