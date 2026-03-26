#!/bin/bash
# ============================================
# ZenForge - One-Command Deploy Script
# ============================================
# Usage: ./deploy.sh [start|stop|restart|status|logs]
#
# Prerequisites:
#   1. Docker & Docker Compose installed
#   2. Ollama installed with a model pulled
#      - Install: https://ollama.com/download
#      - Pull model: ollama pull mistral:7b
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.yml"

print_banner() {
    echo -e "${BLUE}"
    echo "  ╔══════════════════════════════════════╗"
    echo "  ║       ZenForge - AI Learning OS      ║"
    echo "  ║    100% Local  |  100% Private       ║"
    echo "  ╚══════════════════════════════════════╝"
    echo -e "${NC}"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Docker is not installed.${NC}"
        echo "Install Docker: https://docs.docker.com/get-docker/"
        exit 1
    fi
    if ! docker info &> /dev/null 2>&1; then
        echo -e "${RED}Docker daemon is not running. Start Docker Desktop first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}[OK]${NC} Docker is running"
}

check_ollama() {
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        MODEL=$(curl -s http://localhost:11434/api/tags | python3 -c "import sys,json; models=json.load(sys.stdin).get('models',[]); print(', '.join(m['name'] for m in models))" 2>/dev/null || echo "unknown")
        echo -e "${GREEN}[OK]${NC} Ollama is running (models: $MODEL)"
    else
        echo -e "${YELLOW}[WARN]${NC} Ollama is not running on localhost:11434"
        echo "  Start Ollama and pull a model:"
        echo "    ollama serve"
        echo "    ollama pull mistral:7b"
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

start() {
    print_banner
    echo "Checking prerequisites..."
    echo ""
    check_docker
    check_ollama
    echo ""

    echo -e "${BLUE}Building and starting ZenForge...${NC}"
    echo "This may take 5-10 minutes on first run (downloading dependencies)."
    echo ""

    docker compose -f $COMPOSE_FILE up -d --build

    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}  ZenForge is running!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "  Frontend:  ${BLUE}http://localhost:3000/dashboard${NC}"
    echo -e "  Backend:   ${BLUE}http://localhost:8000/docs${NC}"
    echo -e "  Health:    ${BLUE}http://localhost:8000/health${NC}"
    echo ""
    echo "  Stop:      ./deploy.sh stop"
    echo "  Logs:      ./deploy.sh logs"
    echo ""
}

stop() {
    echo -e "${YELLOW}Stopping ZenForge...${NC}"
    docker compose -f $COMPOSE_FILE down
    echo -e "${GREEN}Stopped.${NC}"
}

restart() {
    stop
    start
}

status() {
    print_banner
    echo "Container Status:"
    docker compose -f $COMPOSE_FILE ps
    echo ""

    # Check backend health
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        HEALTH=$(curl -s http://localhost:8000/chat/health)
        echo -e "Backend:  ${GREEN}Healthy${NC}"
        echo "  $HEALTH"
    else
        echo -e "Backend:  ${RED}Not responding${NC}"
    fi

    # Check frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "Frontend: ${GREEN}Running${NC}"
    else
        echo -e "Frontend: ${RED}Not responding${NC}"
    fi

    # Check Ollama
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "Ollama:   ${GREEN}Connected${NC}"
    else
        echo -e "Ollama:   ${RED}Not running${NC}"
    fi
}

logs() {
    docker compose -f $COMPOSE_FILE logs -f --tail=50
}

# Main
case "${1:-start}" in
    start)   start ;;
    stop)    stop ;;
    restart) restart ;;
    status)  status ;;
    logs)    logs ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
