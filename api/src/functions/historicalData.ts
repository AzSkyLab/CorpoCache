import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import {
  queryRows,
  queryRow,
  insert,
  query,
  beginTransaction,
  transactionQuery,
} from '../services/database';
import { ensureUserInDatabase } from '../middleware/auth';
import { sql } from '../services/database';

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

/**
 * Transform DB rows to API response format
 */
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

/**
 * GET /api/historicalData - List all historical data for user
 * POST /api/historicalData - Create a new historical snapshot
 */
async function historicalDataHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);

    if (request.method === 'GET') {
      const headers = await queryRows<HistoricalBillData>(
        `SELECT * FROM HistoricalBillData
         WHERE user_id = @userId
         ORDER BY year DESC, month DESC`,
        { userId: user.id }
      );

      // Get all bill items for these headers
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

      return {
        status: 200,
        jsonBody: result,
      };
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as HistoricalDataInput;

      // Validate required fields
      if (body.month === undefined || body.year === undefined) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required fields: month, year' },
        };
      }

      // Check if entry for this month/year already exists
      const existing = await queryRow<{ id: number }>(
        `SELECT id FROM HistoricalBillData
         WHERE user_id = @userId AND month = @month AND year = @year`,
        { userId: user.id, month: body.month, year: body.year }
      );

      if (existing) {
        return {
          status: 409,
          jsonBody: {
            error: 'Historical data for this month/year already exists',
          },
        };
      }

      // Use transaction to insert header and items
      const transaction = await beginTransaction();

      try {
        // Insert header
        const headerResult = await transactionQuery<{ id: number }>(
          transaction,
          `INSERT INTO HistoricalBillData (user_id, month, year, timestamp)
           OUTPUT INSERTED.id
           VALUES (@userId, @month, @year, @timestamp)`,
          {
            userId: user.id,
            month: body.month,
            year: body.year,
            timestamp: body.timestamp || new Date().toISOString(),
          }
        );

        const headerId = headerResult.recordset[0]?.id;

        if (!headerId) {
          throw new Error('Failed to insert historical bill data header');
        }

        // Insert bill items
        if (body.bills && body.bills.length > 0) {
          for (const bill of body.bills) {
            await transactionQuery(
              transaction,
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

        await transaction.commit();

        // Return the created data
        const header = await queryRow<HistoricalBillData>(
          'SELECT * FROM HistoricalBillData WHERE id = @id',
          { id: headerId }
        );
        const items = await queryRows<HistoricalBillItem>(
          'SELECT * FROM HistoricalBillItems WHERE historical_bill_data_id = @headerId',
          { headerId }
        );

        return {
          status: 201,
          jsonBody: header ? toApiFormat(header, items) : { id: headerId },
        };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in historicalData handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

/**
 * GET /api/historicalData/{id} - Get a specific historical snapshot
 * DELETE /api/historicalData/{id} - Delete a historical snapshot
 */
async function historicalDataByIdHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);
    const id = parseInt(request.params.id || '', 10);

    if (isNaN(id)) {
      return { status: 400, jsonBody: { error: 'Invalid historical data ID' } };
    }

    // Check ownership
    const existing = await queryRow<HistoricalBillData>(
      'SELECT * FROM HistoricalBillData WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );

    if (!existing) {
      return { status: 404, jsonBody: { error: 'Historical data not found' } };
    }

    if (request.method === 'GET') {
      const items = await queryRows<HistoricalBillItem>(
        'SELECT * FROM HistoricalBillItems WHERE historical_bill_data_id = @id',
        { id }
      );
      return { status: 200, jsonBody: toApiFormat(existing, items) };
    }

    if (request.method === 'DELETE') {
      // Items are deleted via cascade
      await query(
        'DELETE FROM HistoricalBillData WHERE id = @id AND user_id = @userId',
        { id, userId: user.id }
      );

      return { status: 204 };
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in historicalData by ID handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

// Register routes
app.http('historicalData', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'historicalData',
  handler: historicalDataHandler,
});

app.http('historicalDataById', {
  methods: ['GET', 'DELETE'],
  authLevel: 'anonymous',
  route: 'historicalData/{id}',
  handler: historicalDataByIdHandler,
});
