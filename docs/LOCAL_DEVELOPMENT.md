# CorpoCache Local Development Guide

This guide explains how to set up and run CorpoCache locally for development and testing.

## Prerequisites

- **Docker** - For running SQL Server locally
- **Node.js** (v18 or v20 recommended) - For the API
- **Python 3** - For the frontend development server
- **Azure Functions Core Tools** - Installed automatically via npm

## Quick Start

```bash
# Make the scripts executable (first time only)
chmod +x scripts/start-local-dev.sh scripts/stop-local-dev.sh

# Start all services
./scripts/start-local-dev.sh

# Stop all services
./scripts/stop-local-dev.sh
```

The startup script will:
1. Start SQL Server in Docker (or use existing container)
2. Create the database and schema if needed
3. Install API dependencies if needed
4. Build the API if needed
5. Start the API server on port 7071
6. Start the frontend server on port 8000

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:8000 | Static file server for the web app |
| API | http://localhost:7071/api | Azure Functions API |
| SQL Server | localhost:1433 | Database server |

## Database Credentials

- **Server:** localhost
- **Database:** corpocache
- **Username:** sa
- **Password:** CorpoCache2024

## Manual Setup

If you prefer to run services manually:

### 1. Start SQL Server

```bash
# Create and start SQL Server container
docker run -d \
  --name corpocache-sql \
  -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=CorpoCache2024" \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest

# Wait for SQL Server to be ready, then create database
docker exec corpocache-sql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'CorpoCache2024' \
  -Q "CREATE DATABASE corpocache" -C

# Run the schema
docker exec -i corpocache-sql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'CorpoCache2024' \
  -d corpocache -C < sql/001_create_tables.sql
```

### 2. Start the API

```bash
cd api
npm install
npm run build
npx azure-functions-core-tools start
```

### 3. Start the Frontend

```bash
# From project root
python3 -m http.server 8000
```

## Configuration

The API uses `api/local.settings.json` for local configuration (not committed to git):

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "LOCAL_DEV_MODE": "true",
    "SQL_CONNECTION_STRING": "Server=localhost;Database=corpocache;User Id=sa;Password=CorpoCache2024;TrustServerCertificate=true;"
  },
  "Host": {
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

## Local Development Mode

When `LOCAL_DEV_MODE=true`, the API:
- Skips Azure Static Web Apps authentication
- Uses a mock user (`local-dev-user`) for all requests
- Allows CORS from any origin

## Troubleshooting

### Port already in use

```bash
# Kill process on port 7071
lsof -ti:7071 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### SQL Server connection issues

```bash
# Check if container is running
docker ps | grep corpocache-sql

# View container logs
docker logs corpocache-sql

# Test connection
docker exec corpocache-sql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'CorpoCache2024' \
  -Q "SELECT 1" -C
```

### Reset database

```bash
# Drop and recreate database
docker exec corpocache-sql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'CorpoCache2024' \
  -Q "DROP DATABASE corpocache; CREATE DATABASE corpocache" -C

# Re-run schema
docker exec -i corpocache-sql /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U sa -P 'CorpoCache2024' \
  -d corpocache -C < sql/001_create_tables.sql
```

### View API logs

```bash
# If using the startup script
tail -f /tmp/corpocache-api.log

# View recent errors
grep -i error /tmp/corpocache-api.log
```

## Generating Test Data

After starting the local environment, you can generate test data:

```bash
node scripts/generate-test-data.js
```

Or manually via curl:

```bash
# Create a credit card
curl -X POST http://localhost:7071/api/creditCards \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Card", "limit": 5000, "balance": 1000, "dueDate": 15}'

# Create a bill
curl -X POST http://localhost:7071/api/bills \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Bill", "amount": 100, "dueDate": 1, "type": "normal"}'
```
