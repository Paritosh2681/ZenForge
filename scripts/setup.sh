#!/bin/bash

# Guru-Agent Setup Script (Linux/Mac)
# Phase 1: Local RAG Foundation

set -e  # Exit on error

echo "======================================"
echo "Guru-Agent Setup - Phase 1"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.10"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo -e "${RED}Error: Python 3.10+ required (found $python_version)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python $python_version${NC}"

# Check Node.js version
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js not found${NC}"
    exit 1
fi
node_version=$(node --version | cut -d 'v' -f 2)
echo -e "${GREEN}✓ Node.js $node_version${NC}"

# Check Ollama
echo "Checking Ollama installation..."
if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}Ollama not found. Installing...${NC}"
    curl -fsSL https://ollama.ai/install.sh | sh
else
    echo -e "${GREEN}✓ Ollama installed${NC}"
fi

# Pull Mistral model
echo "Checking Mistral model..."
if ollama list | grep -q "mistral:7b"; then
    echo -e "${GREEN}✓ Mistral-7B model available${NC}"
else
    echo -e "${YELLOW}Downloading Mistral-7B model (this may take a few minutes)...${NC}"
    ollama pull mistral:7b
    echo -e "${GREEN}✓ Mistral-7B downloaded${NC}"
fi

# Backend setup
echo ""
echo "Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

echo -e "${GREEN}✓ Backend setup complete${NC}"

cd ..

# Frontend setup
echo ""
echo "Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cp .env.local.example .env.local
fi

echo -e "${GREEN}✓ Frontend setup complete${NC}"

cd ..

# Final instructions
echo ""
echo "======================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "======================================"
echo ""
echo "To start Guru-Agent:"
echo ""
echo "1. Terminal 1 - Backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   python -m app.main"
echo ""
echo "2. Terminal 2 - Frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "API Documentation: http://localhost:8000/docs"
echo ""
