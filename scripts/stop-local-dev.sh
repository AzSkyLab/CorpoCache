#!/bin/bash

# CorpoCache Local Development Stop Script
# Stops all local development services

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== Stopping CorpoCache Local Development ===${NC}"
echo ""

# Stop API server
if [ -f /tmp/corpocache-api.pid ]; then
    API_PID=$(cat /tmp/corpocache-api.pid)
    if kill -0 $API_PID 2>/dev/null; then
        kill $API_PID 2>/dev/null
        echo -e "${GREEN}[OK]${NC} API server stopped (PID: $API_PID)"
    fi
    rm -f /tmp/corpocache-api.pid
fi

# Stop frontend server
if [ -f /tmp/corpocache-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/corpocache-frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}[OK]${NC} Frontend server stopped (PID: $FRONTEND_PID)"
    fi
    rm -f /tmp/corpocache-frontend.pid
fi

# Also kill any processes on the ports (in case PIDs are stale)
lsof -ti:7071 2>/dev/null | xargs -r kill -9 2>/dev/null && echo -e "${GREEN}[OK]${NC} Killed process on port 7071" || true
lsof -ti:8000 2>/dev/null | xargs -r kill -9 2>/dev/null && echo -e "${GREEN}[OK]${NC} Killed process on port 8000" || true

echo ""
echo "Note: SQL Server container is still running."
echo "To stop it: docker stop corpocache-sql"
echo "To remove it: docker rm corpocache-sql"
echo ""
