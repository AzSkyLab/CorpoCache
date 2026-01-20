import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { queryRows, queryRow, insert, execute } from '../services/database';
import { ensureUserInDatabase } from '../middleware/auth';

interface Loan {
  id: number;
  user_id: string;
  name: string;
  original_amount: number;
  balance: number;
  interest_rate: number;
  due_date: number;
  type: string;
  term: number | null;
  start_date: string | null;
  first_payment_date: string | null;
  additional_principal: number;
  pmi: number;
  property_tax: number;
  property_insurance: number;
}

interface LoanInput {
  name: string;
  originalAmount: number;
  balance: number;
  interestRate: number;
  dueDate: number;
  type: string;
  term?: number;
  startDate?: string;
  firstPaymentDate?: string;
  additionalPrincipal?: number;
  pmi?: number;
  propertyTax?: number;
  propertyInsurance?: number;
}

/**
 * Transform DB row to API response format
 */
function toApiFormat(row: Loan): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    originalAmount: row.original_amount,
    balance: row.balance,
    interestRate: row.interest_rate,
    dueDate: row.due_date,
    type: row.type,
    term: row.term,
    startDate: row.start_date,
    firstPaymentDate: row.first_payment_date,
    additionalPrincipal: row.additional_principal,
    pmi: row.pmi,
    propertyTax: row.property_tax,
    propertyInsurance: row.property_insurance,
  };
}

/**
 * GET /api/loans - List all loans for user
 * POST /api/loans - Create a new loan
 */
async function loansHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);

    if (request.method === 'GET') {
      const loans = await queryRows<Loan>(
        'SELECT * FROM Loans WHERE user_id = @userId ORDER BY name',
        { userId: user.id }
      );

      return {
        status: 200,
        jsonBody: loans.map(toApiFormat),
      };
    }

    if (request.method === 'POST') {
      const body = (await request.json()) as LoanInput;

      // Validate required fields
      if (
        !body.name ||
        body.originalAmount === undefined ||
        body.balance === undefined ||
        body.interestRate === undefined ||
        body.dueDate === undefined ||
        !body.type
      ) {
        return {
          status: 400,
          jsonBody: {
            error:
              'Missing required fields: name, originalAmount, balance, interestRate, dueDate, type',
          },
        };
      }

      const id = await insert(
        `INSERT INTO Loans (user_id, name, original_amount, balance, interest_rate, due_date, type, term, start_date, first_payment_date, additional_principal, pmi, property_tax, property_insurance)
         VALUES (@userId, @name, @originalAmount, @balance, @interestRate, @dueDate, @type, @term, @startDate, @firstPaymentDate, @additionalPrincipal, @pmi, @propertyTax, @propertyInsurance)`,
        {
          userId: user.id,
          name: body.name.trim(),
          originalAmount: body.originalAmount,
          balance: body.balance,
          interestRate: body.interestRate,
          dueDate: body.dueDate,
          type: body.type,
          term: body.term || null,
          startDate: body.startDate || new Date().toISOString().split('T')[0],
          firstPaymentDate: body.firstPaymentDate || null,
          additionalPrincipal: body.additionalPrincipal || 0,
          pmi: body.pmi || 0,
          propertyTax: body.propertyTax || 0,
          propertyInsurance: body.propertyInsurance || 0,
        }
      );

      const newLoan = await queryRow<Loan>(
        'SELECT * FROM Loans WHERE id = @id',
        { id }
      );

      return {
        status: 201,
        jsonBody: newLoan ? toApiFormat(newLoan) : { id },
      };
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in loans handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

/**
 * GET /api/loans/{id} - Get a specific loan
 * PUT /api/loans/{id} - Update a loan
 * DELETE /api/loans/{id} - Delete a loan
 */
async function loanByIdHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);
    const id = parseInt(request.params.id || '', 10);

    if (isNaN(id)) {
      return { status: 400, jsonBody: { error: 'Invalid loan ID' } };
    }

    // Check ownership
    const existing = await queryRow<Loan>(
      'SELECT * FROM Loans WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );

    if (!existing) {
      return { status: 404, jsonBody: { error: 'Loan not found' } };
    }

    if (request.method === 'GET') {
      return { status: 200, jsonBody: toApiFormat(existing) };
    }

    if (request.method === 'PUT') {
      const body = (await request.json()) as Partial<LoanInput>;

      await execute(
        `UPDATE Loans SET
          name = COALESCE(@name, name),
          original_amount = COALESCE(@originalAmount, original_amount),
          balance = COALESCE(@balance, balance),
          interest_rate = COALESCE(@interestRate, interest_rate),
          due_date = COALESCE(@dueDate, due_date),
          type = COALESCE(@type, type),
          term = COALESCE(@term, term),
          start_date = COALESCE(@startDate, start_date),
          first_payment_date = COALESCE(@firstPaymentDate, first_payment_date),
          additional_principal = COALESCE(@additionalPrincipal, additional_principal),
          pmi = COALESCE(@pmi, pmi),
          property_tax = COALESCE(@propertyTax, property_tax),
          property_insurance = COALESCE(@propertyInsurance, property_insurance),
          updated_at = GETUTCDATE()
         WHERE id = @id AND user_id = @userId`,
        {
          id,
          userId: user.id,
          name: body.name?.trim(),
          originalAmount: body.originalAmount,
          balance: body.balance,
          interestRate: body.interestRate,
          dueDate: body.dueDate,
          type: body.type,
          term: body.term,
          startDate: body.startDate,
          firstPaymentDate: body.firstPaymentDate,
          additionalPrincipal: body.additionalPrincipal,
          pmi: body.pmi,
          propertyTax: body.propertyTax,
          propertyInsurance: body.propertyInsurance,
        }
      );

      const updated = await queryRow<Loan>(
        'SELECT * FROM Loans WHERE id = @id',
        { id }
      );

      return { status: 200, jsonBody: updated ? toApiFormat(updated) : {} };
    }

    if (request.method === 'DELETE') {
      await execute(
        'DELETE FROM Loans WHERE id = @id AND user_id = @userId',
        { id, userId: user.id }
      );

      return { status: 204 };
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in loan by ID handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

// Register routes
app.http('loans', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'loans',
  handler: loansHandler,
});

app.http('loanById', {
  methods: ['GET', 'PUT', 'DELETE'],
  authLevel: 'anonymous',
  route: 'loans/{id}',
  handler: loanByIdHandler,
});
