# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CorpoCache is a personal finance dashboard web application with a cyberpunk aesthetic. It helps users track credit cards, monthly bills, loans, income/salary calculations, and savings estimates.

## Architecture

### Frontend
- Static SPA: `index.html` + vanilla JavaScript + Tailwind CSS
- `js/script.js` — Main application logic (~7000+ lines)
- `js/api-client.js` — HTTP client for backend API
- `js/data-service.js` — Abstraction layer (API mode with localStorage fallback)
- `js/amortization.js`, `js/completion.js` — Loan chart/calculation helpers
- `js/cyberpunk-bg.js` — Animated background effects

### Backend (`api/`)
- Express.js + TypeScript + PostgreSQL (via `pg`)
- Entrypoint: `api/src/server.ts`
- Routes: `api/src/functions/` — bills, creditCards, expenses, loans, salaryData, profitData, historicalData, userData, sync
- Database: `api/src/services/database.ts` — pg Pool with `@paramName` → `$1` param conversion
- Auth: `api/src/middleware/auth.ts` — hardcoded single homelab user
- Schema: `sql/001_create_tables.sql` (PostgreSQL)

### Deployment
- Containerized: `Dockerfile.frontend` (nginx), `Dockerfile.api` (Node.js)
- Helm chart: `helm/corpocache/`
- CI/CD: GitHub Actions builds containers to ghcr.io on push to main
- Deployed to homelab k3s via ArgoCD

## Development

### Local Development (docker compose)
```bash
./scripts/start-local-dev.sh
# or directly:
docker compose up --build
```
- Frontend: http://localhost:8080
- API: http://localhost:3000/api
- PostgreSQL: localhost:5432

### API Only (without Docker)
```bash
cd api
cp .env.example .env  # Configure PostgreSQL connection
npm install
npm run build
npm start
```

### Frontend Only
Open `index.html` in a browser or use any HTTP server. Falls back to localStorage when API is unreachable.

## Key Patterns

### Data Flow
1. User interacts with modals (add/edit credit cards, bills, loans)
2. `DataService` calls `ApiClient` (API mode) or updates localStorage (local mode)
3. `render*()` functions update DOM
4. `update*Summary()` functions recalculate totals

### Database Parameterization
All SQL uses `@paramName` named parameters. The `convertNamedParams()` helper in `database.ts` converts these to PostgreSQL positional `$1` params at runtime.

### Modal Pattern
All forms use a consistent modal pattern with IDs like `addBillModal`, `salaryModal`, etc. Open/close via functions like `showAddBillModal()`, `closeBillModal()`.
