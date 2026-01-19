#!/bin/bash

# CorpoCache Local Development Startup Script
# This script starts all services needed for local development

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

# SQL Server Configuration
SQL_CONTAINER_NAME="corpocache-sql"
SQL_PASSWORD="CorpoCache2024"
SQL_PORT="1433"

# Check if SQL Server container exists
if docker ps -a --format '{{.Names}}' | grep -q "^${SQL_CONTAINER_NAME}$"; then
    # Container exists, check if it's running
    if docker ps --format '{{.Names}}' | grep -q "^${SQL_CONTAINER_NAME}$"; then
        echo -e "${GREEN}[OK]${NC} SQL Server container is already running"
    else
        echo -e "${YELLOW}[...]${NC} Starting existing SQL Server container..."
        docker start $SQL_CONTAINER_NAME
        echo -e "${GREEN}[OK]${NC} SQL Server container started"
    fi
else
    echo -e "${YELLOW}[...]${NC} Creating SQL Server container..."
    docker run -d \
        --name $SQL_CONTAINER_NAME \
        -e "ACCEPT_EULA=Y" \
        -e "MSSQL_SA_PASSWORD=$SQL_PASSWORD" \
        -p $SQL_PORT:1433 \
        mcr.microsoft.com/mssql/server:2022-latest
    echo -e "${GREEN}[OK]${NC} SQL Server container created"
fi

# Wait for SQL Server to be ready
echo -e "${YELLOW}[...]${NC} Waiting for SQL Server to be ready..."
for i in {1..30}; do
    if docker exec $SQL_CONTAINER_NAME /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SQL_PASSWORD" -Q "SELECT 1" -C > /dev/null 2>&1; then
        echo -e "${GREEN}[OK]${NC} SQL Server is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Error: SQL Server did not become ready in time${NC}"
        exit 1
    fi
    sleep 2
done

# Check if database exists, create if not
DB_EXISTS=$(docker exec $SQL_CONTAINER_NAME /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SQL_PASSWORD" -Q "SELECT COUNT(*) FROM sys.databases WHERE name = 'corpocache'" -C -h -1 2>/dev/null | tr -d ' ')

if [ "$DB_EXISTS" = "0" ]; then
    echo -e "${YELLOW}[...]${NC} Creating database and schema..."
    docker exec $SQL_CONTAINER_NAME /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SQL_PASSWORD" -Q "CREATE DATABASE corpocache" -C

    # Run schema
    docker exec -i $SQL_CONTAINER_NAME /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$SQL_PASSWORD" -d corpocache -C < "$PROJECT_ROOT/sql/001_create_tables.sql"
    echo -e "${GREEN}[OK]${NC} Database and schema created"
else
    echo -e "${GREEN}[OK]${NC} Database already exists"
fi

# Check if API dependencies are installed
if [ ! -d "$PROJECT_ROOT/api/node_modules" ]; then
    echo -e "${YELLOW}[...]${NC} Installing API dependencies..."
    cd "$PROJECT_ROOT/api" && npm install
    echo -e "${GREEN}[OK]${NC} API dependencies installed"
fi

# Build API if needed
if [ ! -d "$PROJECT_ROOT/api/dist" ]; then
    echo -e "${YELLOW}[...]${NC} Building API..."
    cd "$PROJECT_ROOT/api" && npm run build
    echo -e "${GREEN}[OK]${NC} API built"
fi

# Kill any existing processes on ports 7071 and 8000
echo -e "${YELLOW}[...]${NC} Checking for existing processes..."
lsof -ti:7071 2>/dev/null | xargs -r kill -9 2>/dev/null || true
lsof -ti:8000 2>/dev/null | xargs -r kill -9 2>/dev/null || true

# Start the API server in background
echo -e "${YELLOW}[...]${NC} Starting API server..."
cd "$PROJECT_ROOT/api"
npx azure-functions-core-tools start > /tmp/corpocache-api.log 2>&1 &
API_PID=$!

# Wait for API to be ready
for i in {1..30}; do
    if curl -s http://localhost:7071/api/me > /dev/null 2>&1; then
        echo -e "${GREEN}[OK]${NC} API server is ready (PID: $API_PID)"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Error: API server did not start in time${NC}"
        echo "Check logs at /tmp/corpocache-api.log"
        exit 1
    fi
    sleep 1
done

# Start frontend server
echo -e "${YELLOW}[...]${NC} Starting frontend server..."
cd "$PROJECT_ROOT"
python3 -m http.server 8000 > /tmp/corpocache-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}[OK]${NC} Frontend server started (PID: $FRONTEND_PID)"

echo ""
echo -e "${GREEN}=== All services started ===${NC}"
echo ""
echo "  Frontend:  http://localhost:8000"
echo "  API:       http://localhost:7071/api"
echo "  SQL:       localhost:1433 (sa / $SQL_PASSWORD)"
echo ""
echo "Logs:"
echo "  API:       /tmp/corpocache-api.log"
echo "  Frontend:  /tmp/corpocache-frontend.log"
echo ""
echo "To stop all services, run: ./scripts/stop-local-dev.sh"
echo ""

# Save PIDs for stop script
echo "$API_PID" > /tmp/corpocache-api.pid
echo "$FRONTEND_PID" > /tmp/corpocache-frontend.pid
