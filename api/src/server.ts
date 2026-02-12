import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { closePool, checkConnection } from './services/database';
import { ensureUserInDatabase } from './middleware/auth';

// Import routers
import billsRouter from './functions/bills';
import creditCardsRouter from './functions/creditCards';
import expensesRouter from './functions/expenses';
import loansRouter from './functions/loans';
import salaryDataRouter from './functions/salaryData';
import profitDataRouter from './functions/profitData';
import historicalDataRouter from './functions/historicalData';
import userDataRouter from './functions/userData';
import syncRouter from './functions/sync';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health endpoints (no auth)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/ready', async (_req, res) => {
  const dbOk = await checkConnection();
  if (dbOk) {
    res.json({ status: 'ok' });
  } else {
    res.status(503).json({ status: 'unavailable', reason: 'database unreachable' });
  }
});

// All API routes require auth (ensures user exists in DB)
app.use('/api', ensureUserInDatabase);

// Mount routers
app.use('/api', billsRouter);
app.use('/api', creditCardsRouter);
app.use('/api', expensesRouter);
app.use('/api', loansRouter);
app.use('/api', salaryDataRouter);
app.use('/api', profitDataRouter);
app.use('/api', historicalDataRouter);
app.use('/api', userDataRouter);
app.use('/api', syncRouter);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`CorpoCache API listening on port ${PORT}`);
});

// Graceful shutdown
function shutdown() {
  console.log('Shutting down...');
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
