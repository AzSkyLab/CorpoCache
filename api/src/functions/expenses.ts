import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { queryRows, queryRow, insert, execute } from '../services/database';
import { ensureUserInDatabase } from '../middleware/auth';

interface Expense {
  id: number;
  user_id: string;
  name: string;
  amount: number;
  category: string;
}

interface ExpenseInput {
  name: string;
  amount: number;
  category: string;
}

/**
 * Transform DB row to API response format
 */
function toApiFormat(row: Expense): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    category: row.category,
  };
}

/**
 * GET /api/expenses - List all expenses for user
 * POST /api/expenses - Create a new expense
 */
async function expensesHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);

    if (request.method === 'GET') {
      const expenses = await queryRows<Expense>(
        'SELECT * FROM Expenses WHERE user_id = @userId ORDER BY category, name',
        { userId: user.id }
      );

      return {
        status: 200,
        jsonBody: expenses.map(toApiFormat),
      };
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as ExpenseInput;

      // Validate required fields
      if (!body.name || body.amount === undefined || !body.category) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required fields: name, amount, category' },
        };
      }

      const id = await insert(
        `INSERT INTO Expenses (user_id, name, amount, category)
         VALUES (@userId, @name, @amount, @category)`,
        {
          userId: user.id,
          name: body.name.trim(),
          amount: body.amount,
          category: body.category.trim(),
        }
      );

      const newExpense = await queryRow<Expense>(
        'SELECT * FROM Expenses WHERE id = @id',
        { id }
      );

      return {
        status: 201,
        jsonBody: newExpense ? toApiFormat(newExpense) : { id },
      };
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in expenses handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

/**
 * GET /api/expenses/{id} - Get a specific expense
 * DELETE /api/expenses/{id} - Delete an expense
 */
async function expenseByIdHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);
    const id = parseInt(request.params.id || '', 10);

    if (isNaN(id)) {
      return { status: 400, jsonBody: { error: 'Invalid expense ID' } };
    }

    // Check ownership
    const existing = await queryRow<Expense>(
      'SELECT * FROM Expenses WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );

    if (!existing) {
      return { status: 404, jsonBody: { error: 'Expense not found' } };
    }

    if (request.method === 'GET') {
      return { status: 200, jsonBody: toApiFormat(existing) };
    }

    if (request.method === 'DELETE') {
      await execute(
        'DELETE FROM Expenses WHERE id = @id AND user_id = @userId',
        { id, userId: user.id }
      );

      return { status: 204 };
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in expense by ID handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

/**
 * DELETE /api/expenses - Delete all expenses for user
 */
async function expensesClearHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);

    await execute('DELETE FROM Expenses WHERE user_id = @userId', {
      userId: user.id,
    });

    return {
      status: 200,
      jsonBody: { message: 'All expenses cleared' },
    };
  } catch (error) {
    context.error('Error in expenses clear handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

// Register routes
app.http('expenses', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'expenses',
  handler: expensesHandler,
});

app.http('expenseById', {
  methods: ['GET', 'DELETE'],
  authLevel: 'anonymous',
  route: 'expenses/{id}',
  handler: expenseByIdHandler,
});

app.http('expensesClear', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'expenses/all',
  handler: expensesClearHandler,
});
