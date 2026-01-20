import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { queryRows, queryRow, insert, execute } from '../services/database';
import { ensureUserInDatabase } from '../middleware/auth';

interface Bill {
  id: number;
  user_id: string;
  name: string;
  amount: number;
  due_date: number;
  type: string;
  priority: string;
  is_paid: boolean;
  varying_amount: boolean;
  auto_pay: boolean;
  payment_account: string | null;
  credit_card_id: number | null;
}

interface BillInput {
  name: string;
  amount: number;
  dueDate: number;
  type?: string;
  priority?: string;
  isPaid?: boolean;
  varyingAmount?: boolean;
  autoPay?: boolean;
  paymentAccount?: string;
  creditCardId?: number;
}

/**
 * Transform DB row to API response format
 */
function toApiFormat(row: Bill): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    dueDate: row.due_date,
    type: row.type,
    priority: row.priority,
    isPaid: row.is_paid,
    varyingAmount: row.varying_amount,
    autoPay: row.auto_pay,
    paymentAccount: row.payment_account,
    creditCardId: row.credit_card_id,
  };
}

/**
 * GET /api/bills - List all bills for user
 * POST /api/bills - Create a new bill
 */
async function billsHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);

    if (request.method === 'GET') {
      const bills = await queryRows<Bill>(
        'SELECT * FROM Bills WHERE user_id = @userId ORDER BY due_date, name',
        { userId: user.id }
      );

      return {
        status: 200,
        jsonBody: bills.map(toApiFormat),
      };
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as BillInput;

      // Validate required fields
      if (!body.name || body.amount === undefined || body.dueDate === undefined) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required fields: name, amount, dueDate' },
        };
      }

      const id = await insert(
        `INSERT INTO Bills (user_id, name, amount, due_date, type, priority, is_paid, varying_amount, auto_pay, payment_account, credit_card_id)
         VALUES (@userId, @name, @amount, @dueDate, @type, @priority, @isPaid, @varyingAmount, @autoPay, @paymentAccount, @creditCardId)`,
        {
          userId: user.id,
          name: body.name.trim(),
          amount: body.amount,
          dueDate: body.dueDate,
          type: body.type || 'normal',
          priority: body.priority || 'normal',
          isPaid: body.isPaid || false,
          varyingAmount: body.varyingAmount || false,
          autoPay: body.autoPay || false,
          paymentAccount: body.paymentAccount || null,
          creditCardId: body.creditCardId || null,
        }
      );

      const newBill = await queryRow<Bill>(
        'SELECT * FROM Bills WHERE id = @id',
        { id }
      );

      return {
        status: 201,
        jsonBody: newBill ? toApiFormat(newBill) : { id },
      };
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in bills handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

/**
 * GET /api/bills/{id} - Get a specific bill
 * PUT /api/bills/{id} - Update a bill
 * DELETE /api/bills/{id} - Delete a bill
 */
async function billByIdHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);
    const id = parseInt(request.params.id || '', 10);

    if (isNaN(id)) {
      return { status: 400, jsonBody: { error: 'Invalid bill ID' } };
    }

    // Check ownership
    const existing = await queryRow<Bill>(
      'SELECT * FROM Bills WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );

    if (!existing) {
      return { status: 404, jsonBody: { error: 'Bill not found' } };
    }

    if (request.method === 'GET') {
      return { status: 200, jsonBody: toApiFormat(existing) };
    }

    if (request.method === 'PUT') {
      const body = (await request.json()) as Partial<BillInput>;

      await execute(
        `UPDATE Bills SET
          name = COALESCE(@name, name),
          amount = COALESCE(@amount, amount),
          due_date = COALESCE(@dueDate, due_date),
          type = COALESCE(@type, type),
          priority = COALESCE(@priority, priority),
          is_paid = COALESCE(@isPaid, is_paid),
          varying_amount = COALESCE(@varyingAmount, varying_amount),
          auto_pay = COALESCE(@autoPay, auto_pay),
          payment_account = COALESCE(@paymentAccount, payment_account),
          credit_card_id = COALESCE(@creditCardId, credit_card_id),
          updated_at = GETUTCDATE()
         WHERE id = @id AND user_id = @userId`,
        {
          id,
          userId: user.id,
          name: body.name?.trim(),
          amount: body.amount,
          dueDate: body.dueDate,
          type: body.type,
          priority: body.priority,
          isPaid: body.isPaid,
          varyingAmount: body.varyingAmount,
          autoPay: body.autoPay,
          paymentAccount: body.paymentAccount,
          creditCardId: body.creditCardId,
        }
      );

      const updated = await queryRow<Bill>(
        'SELECT * FROM Bills WHERE id = @id',
        { id }
      );

      return { status: 200, jsonBody: updated ? toApiFormat(updated) : {} };
    }

    if (request.method === 'DELETE') {
      await execute(
        'DELETE FROM Bills WHERE id = @id AND user_id = @userId',
        { id, userId: user.id }
      );

      return { status: 204 };
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in bill by ID handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

/**
 * PUT /api/bills/{id}/paid - Toggle paid status
 */
async function billTogglePaidHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);
    const id = parseInt(request.params.id || '', 10);

    if (isNaN(id)) {
      return { status: 400, jsonBody: { error: 'Invalid bill ID' } };
    }

    // Check ownership and get current status
    const existing = await queryRow<Bill>(
      'SELECT * FROM Bills WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );

    if (!existing) {
      return { status: 404, jsonBody: { error: 'Bill not found' } };
    }

    // Toggle the paid status
    const newPaidStatus = !existing.is_paid;

    await execute(
      `UPDATE Bills SET is_paid = @isPaid, updated_at = GETUTCDATE()
       WHERE id = @id AND user_id = @userId`,
      { id, userId: user.id, isPaid: newPaidStatus }
    );

    return {
      status: 200,
      jsonBody: { id, isPaid: newPaidStatus },
    };
  } catch (error) {
    context.error('Error in bill toggle paid handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

/**
 * PUT /api/bills/resetPaid - Reset all bills to unpaid (for new month)
 */
async function billsResetPaidHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);

    await execute(
      `UPDATE Bills SET is_paid = 0, updated_at = GETUTCDATE()
       WHERE user_id = @userId`,
      { userId: user.id }
    );

    return {
      status: 200,
      jsonBody: { message: 'All bills reset to unpaid' },
    };
  } catch (error) {
    context.error('Error in bills reset paid handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

// Register routes
app.http('bills', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'bills',
  handler: billsHandler,
});

app.http('billById', {
  methods: ['GET', 'PUT', 'DELETE'],
  authLevel: 'anonymous',
  route: 'bills/{id}',
  handler: billByIdHandler,
});

app.http('billTogglePaid', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'bills/{id}/paid',
  handler: billTogglePaidHandler,
});

app.http('billsResetPaid', {
  methods: ['PUT'],
  authLevel: 'anonymous',
  route: 'bills/resetPaid',
  handler: billsResetPaidHandler,
});
