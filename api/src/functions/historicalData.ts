import { Router, Request, Response } from 'express';
import {
  queryRows,
  queryRow,
  query,
  beginTransaction,
  transactionQuery,
  commitTransaction,
  rollbackTransaction,
} from '../services/database';

const router = Router();

interface HistoricalBillData {
  id: number;
  user_id: string;
  month: number;
  year: number;
  timestamp: string;
}

interface HistoricalBillItem {
  id: number;
  historical_bill_data_id: number;
  name: string;
  amount: number;
  type: string;
  due_date: number;
  is_paid: boolean;
  payment_account: string | null;
}

interface HistoricalBillInput {
  name: string;
  amount: number;
  type: string;
  dueDate: number;
  isPaid: boolean;
  paymentAccount?: string;
}

interface HistoricalDataInput {
  month: number;
  year: number;
  timestamp?: string;
  bills: HistoricalBillInput[];
}

function toApiFormat(
  header: HistoricalBillData,
  items: HistoricalBillItem[]
): Record<string, unknown> {
  return {
    id: header.id,
    month: header.month,
    year: header.year,
    timestamp: header.timestamp,
    bills: items.map((item) => ({
      name: item.name,
      amount: item.amount,
      type: item.type,
      dueDate: item.due_date,
      isPaid: item.is_paid,
      paymentAccount: item.payment_account,
    })),
  };
}

// GET /api/historicalData
router.get('/historicalData', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const headers = await queryRows<HistoricalBillData>(
      `SELECT * FROM HistoricalBillData
       WHERE user_id = @userId
       ORDER BY year DESC, month DESC`,
      { userId: user.id }
    );

    const result: Record<string, unknown>[] = [];
    for (const header of headers) {
      const items = await queryRows<HistoricalBillItem>(
        `SELECT * FROM HistoricalBillItems
         WHERE historical_bill_data_id = @headerId
         ORDER BY due_date, name`,
        { headerId: header.id }
      );
      result.push(toApiFormat(header, items));
    }

    res.json(result);
  } catch (error) {
    console.error('Error in GET /historicalData:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/historicalData
router.post('/historicalData', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const body = req.body as HistoricalDataInput;

    if (body.month === undefined || body.year === undefined) {
      res.status(400).json({ error: 'Missing required fields: month, year' });
      return;
    }

    const existing = await queryRow<{ id: number }>(
      `SELECT id FROM HistoricalBillData
       WHERE user_id = @userId AND month = @month AND year = @year`,
      { userId: user.id, month: body.month, year: body.year }
    );

    if (existing) {
      res.status(409).json({ error: 'Historical data for this month/year already exists' });
      return;
    }

    const client = await beginTransaction();

    try {
      const headerResult = await transactionQuery<{ id: number }>(
        client,
        `INSERT INTO HistoricalBillData (user_id, month, year, timestamp)
         VALUES (@userId, @month, @year, @timestamp) RETURNING id`,
        {
          userId: user.id,
          month: body.month,
          year: body.year,
          timestamp: body.timestamp || new Date().toISOString(),
        }
      );

      const headerId = headerResult.rows[0]?.id;
      if (!headerId) throw new Error('Failed to insert historical bill data header');

      if (body.bills && body.bills.length > 0) {
        for (const bill of body.bills) {
          await transactionQuery(
            client,
            `INSERT INTO HistoricalBillItems
             (historical_bill_data_id, name, amount, type, due_date, is_paid, payment_account)
             VALUES (@headerId, @name, @amount, @type, @dueDate, @isPaid, @paymentAccount)`,
            {
              headerId,
              name: bill.name,
              amount: bill.amount,
              type: bill.type,
              dueDate: bill.dueDate,
              isPaid: bill.isPaid,
              paymentAccount: bill.paymentAccount || null,
            }
          );
        }
      }

      await commitTransaction(client);

      const header = await queryRow<HistoricalBillData>(
        'SELECT * FROM HistoricalBillData WHERE id = @id',
        { id: headerId }
      );
      const items = await queryRows<HistoricalBillItem>(
        'SELECT * FROM HistoricalBillItems WHERE historical_bill_data_id = @headerId',
        { headerId }
      );

      res.status(201).json(header ? toApiFormat(header, items) : { id: headerId });
    } catch (error) {
      await rollbackTransaction(client);
      throw error;
    }
  } catch (error) {
    console.error('Error in POST /historicalData:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/historicalData/:id
router.get('/historicalData/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid historical data ID' }); return; }

    const existing = await queryRow<HistoricalBillData>(
      'SELECT * FROM HistoricalBillData WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Historical data not found' }); return; }

    const items = await queryRows<HistoricalBillItem>(
      'SELECT * FROM HistoricalBillItems WHERE historical_bill_data_id = @id',
      { id }
    );
    res.json(toApiFormat(existing, items));
  } catch (error) {
    console.error('Error in GET /historicalData/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/historicalData/:id
router.delete('/historicalData/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid historical data ID' }); return; }

    const existing = await queryRow<HistoricalBillData>(
      'SELECT * FROM HistoricalBillData WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Historical data not found' }); return; }

    await query(
      'DELETE FROM HistoricalBillData WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /historicalData/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
