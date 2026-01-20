# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CorpoCache is a personal finance dashboard web application with a cyberpunk aesthetic. It helps users track credit cards, monthly bills, loans, income/salary calculations, and savings estimates. The app is a static single-page application using vanilla JavaScript, Tailwind CSS, and localStorage for persistence.

## Development

This is a static site with no build step required. To develop:

1. Open `index.html` directly in a browser, or
2. Use any local HTTP server (e.g., `python -m http.server 8000`)

**Deployment**: The app auto-deploys to Azure Static Web Apps via GitHub Actions on push to `main`.

## Architecture

### Single-Page Structure
- `index.html` - Contains the entire UI structure (modals, sections, forms) in one ~100KB file
- All UI is rendered via JavaScript DOM manipulation, no templating library

### JavaScript Organization (`js/`)
- `script.js` - Main application logic (~7000+ lines):
  - Global data arrays: `creditCards`, `bills`, `expenses`, `loans`, `salaryData`, `profitData`
  - localStorage persistence via `saveToLocalStorage()` / `loadFromLocalStorage()`
  - Tax calculations with 2025 federal brackets (`taxBrackets2025` object)
  - Render functions follow pattern: `renderCreditCards()`, `renderBills()`, `renderLoans()`, etc.
  - Summary updates: `updateCreditSummary()`, `updatePaymentSchedule()`, `updateLoanSummary()`
- `amortization.js` - Loan amortization chart generation using SVG
- `completion.js` - Additional loan calculation templates
- `cyberpunk-bg.js` - Animated background effects

### CSS Organization (`css/`)
- `style.css` - Main styling, glass morphism effects, cyberpunk theme variables
- `cyberpunk-bg.css` - Animated grid/circuit background
- `circuit-lines.css` - Circuit line animations
- `amortization-chart.css` - Loan chart styling

### Data Flow
1. User interacts with modals (add/edit credit cards, bills, loans)
2. Data stored in global arrays
3. `render*()` functions update DOM
4. `update*Summary()` functions recalculate totals
5. `saveToLocalStorage()` persists state (manual or auto-save)

### Key Features
- **Credit Cards**: Track limits, balances, utilization percentages, payment suggestions for 29%/9% thresholds
- **Bills**: Categorize by paycheck (15th vs end-of-month), track paid status, "Complete Month" workflow
- **Loans**: Amortization calculations, extra principal payment projections
- **Income**: Salary breakdown with federal/state tax, 401k, ESPP, insurance deductions
- **Historical Data**: `historicalBillData` array tracks month-over-month

### Modal Pattern
All forms use a consistent modal pattern with IDs like `addBillModal`, `salaryModal`, etc. Open/close via functions like `showAddBillModal()`, `closeBillModal()`.
