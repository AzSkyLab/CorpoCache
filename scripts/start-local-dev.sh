#!/bin/bash

# CorpoCache Local Development Startup Script
# Uses docker-compose to start all services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== CorpoCache Local Development ===${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Start services
echo -e "${YELLOW}[...]${NC} Starting services with docker compose..."
cd "$PROJECT_ROOT"
docker compose up --build -d

# Wait for API to be ready
echo -e "${YELLOW}[...]${NC} Waiting for API to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}[OK]${NC} API server is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Error: API server did not start in time${NC}"
        echo "Check logs with: docker compose logs api"
        exit 1
    fi
    sleep 2
done

echo ""
echo -e "${GREEN}=== All services started ===${NC}"
echo ""
echo "  Frontend:  http://localhost:8080"
echo "  API:       http://localhost:3000/api"
echo "  PostgreSQL: localhost:5432 (corpocache / corpocache-dev)"
echo ""
echo "Logs:  docker compose logs -f"
echo "Stop:  docker compose down"
echo ""
