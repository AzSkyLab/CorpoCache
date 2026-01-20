import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { queryRows, queryRow, insert, execute } from '../services/database';
import { ensureUserInDatabase } from '../middleware/auth';

interface CreditCard {
  id: number;
  user_id: string;
  name: string;
  credit_limit: number;
  balance: number;
  open_date: string | null;
  due_date: number;
  custom_image: string | null;
}

interface CreditCardInput {
  name: string;
  limit: number;
  balance: number;
  openDate?: string;
  dueDate: number;
  customImage?: string;
}

/**
 * Transform DB row to API response format
 */
function toApiFormat(row: CreditCard): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    limit: row.credit_limit,
    balance: row.balance,
    openDate: row.open_date,
    dueDate: row.due_date,
    customImage: row.custom_image,
  };
}

/**
 * GET /api/creditCards - List all credit cards for user
 * POST /api/creditCards - Create a new credit card
 */
async function creditCardsHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);

    if (request.method === 'GET') {
      const cards = await queryRows<CreditCard>(
        'SELECT * FROM CreditCards WHERE user_id = @userId ORDER BY name',
        { userId: user.id }
      );

      return {
        status: 200,
        jsonBody: cards.map(toApiFormat),
      };
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as CreditCardInput;

      // Validate required fields
      if (!body.name || body.limit === undefined || body.dueDate === undefined) {
        return {
          status: 400,
          jsonBody: { error: 'Missing required fields: name, limit, dueDate' },
        };
      }

      const id = await insert(
        `INSERT INTO CreditCards (user_id, name, credit_limit, balance, open_date, due_date, custom_image)
         VALUES (@userId, @name, @limit, @balance, @openDate, @dueDate, @customImage)`,
        {
          userId: user.id,
          name: body.name.trim(),
          limit: body.limit,
          balance: body.balance || 0,
          openDate: body.openDate || null,
          dueDate: body.dueDate,
          customImage: body.customImage || null,
        }
      );

      const newCard = await queryRow<CreditCard>(
        'SELECT * FROM CreditCards WHERE id = @id',
        { id }
      );

      return {
        status: 201,
        jsonBody: newCard ? toApiFormat(newCard) : { id },
      };
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in creditCards handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

/**
 * GET /api/creditCards/{id} - Get a specific credit card
 * PUT /api/creditCards/{id} - Update a credit card
 * DELETE /api/creditCards/{id} - Delete a credit card
 */
async function creditCardByIdHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);
    const id = parseInt(request.params.id || '', 10);

    if (isNaN(id)) {
      return { status: 400, jsonBody: { error: 'Invalid credit card ID' } };
    }

    // Check ownership
    const existing = await queryRow<CreditCard>(
      'SELECT * FROM CreditCards WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );

    if (!existing) {
      return { status: 404, jsonBody: { error: 'Credit card not found' } };
    }

    if (request.method === 'GET') {
      return { status: 200, jsonBody: toApiFormat(existing) };
    }

    if (request.method === 'PUT') {
      const body = (await request.json()) as Partial<CreditCardInput>;

      await execute(
        `UPDATE CreditCards SET
          name = COALESCE(@name, name),
          credit_limit = COALESCE(@limit, credit_limit),
          balance = COALESCE(@balance, balance),
          open_date = COALESCE(@openDate, open_date),
          due_date = COALESCE(@dueDate, due_date),
          custom_image = COALESCE(@customImage, custom_image),
          updated_at = GETUTCDATE()
         WHERE id = @id AND user_id = @userId`,
        {
          id,
          userId: user.id,
          name: body.name?.trim(),
          limit: body.limit,
          balance: body.balance,
          openDate: body.openDate,
          dueDate: body.dueDate,
          customImage: body.customImage,
        }
      );

      const updated = await queryRow<CreditCard>(
        'SELECT * FROM CreditCards WHERE id = @id',
        { id }
      );

      return { status: 200, jsonBody: updated ? toApiFormat(updated) : {} };
    }

    if (request.method === 'DELETE') {
      await execute(
        'DELETE FROM CreditCards WHERE id = @id AND user_id = @userId',
        { id, userId: user.id }
      );

      return { status: 204 };
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in creditCard by ID handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

// Register routes
app.http('creditCards', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous', // Auth handled by Static Web Apps
  route: 'creditCards',
  handler: creditCardsHandler,
});

app.http('creditCardById', {
  methods: ['GET', 'PUT', 'DELETE'],
  authLevel: 'anonymous',
  route: 'creditCards/{id}',
  handler: creditCardByIdHandler,
});
