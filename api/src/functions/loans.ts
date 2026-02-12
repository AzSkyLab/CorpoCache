import { Router, Request, Response } from 'express';
import { queryRows, queryRow, insert, execute } from '../services/database';

const router = Router();

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

// GET /api/loans
router.get('/loans', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const loans = await queryRows<Loan>(
      'SELECT * FROM Loans WHERE user_id = @userId ORDER BY name',
      { userId: user.id }
    );
    res.json(loans.map(toApiFormat));
  } catch (error) {
    console.error('Error in GET /loans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/loans
router.post('/loans', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const body = req.body as LoanInput;

    if (!body.name || body.originalAmount === undefined || body.balance === undefined ||
        body.interestRate === undefined || body.dueDate === undefined || !body.type) {
      res.status(400).json({
        error: 'Missing required fields: name, originalAmount, balance, interestRate, dueDate, type',
      });
      return;
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

    const newLoan = await queryRow<Loan>('SELECT * FROM Loans WHERE id = @id', { id });
    res.status(201).json(newLoan ? toApiFormat(newLoan) : { id });
  } catch (error) {
    console.error('Error in POST /loans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/loans/:id
router.get('/loans/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid loan ID' }); return; }

    const existing = await queryRow<Loan>(
      'SELECT * FROM Loans WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Loan not found' }); return; }

    res.json(toApiFormat(existing));
  } catch (error) {
    console.error('Error in GET /loans/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/loans/:id
router.put('/loans/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid loan ID' }); return; }

    const existing = await queryRow<Loan>(
      'SELECT * FROM Loans WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Loan not found' }); return; }

    const body = req.body as Partial<LoanInput>;

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
        updated_at = NOW()
       WHERE id = @id AND user_id = @userId`,
      {
        id, userId: user.id,
        name: body.name?.trim(), originalAmount: body.originalAmount,
        balance: body.balance, interestRate: body.interestRate,
        dueDate: body.dueDate, type: body.type, term: body.term,
        startDate: body.startDate, firstPaymentDate: body.firstPaymentDate,
        additionalPrincipal: body.additionalPrincipal, pmi: body.pmi,
        propertyTax: body.propertyTax, propertyInsurance: body.propertyInsurance,
      }
    );

    const updated = await queryRow<Loan>('SELECT * FROM Loans WHERE id = @id', { id });
    res.json(updated ? toApiFormat(updated) : {});
  } catch (error) {
    console.error('Error in PUT /loans/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/loans/:id
router.delete('/loans/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid loan ID' }); return; }

    const existing = await queryRow<Loan>(
      'SELECT * FROM Loans WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Loan not found' }); return; }

    await execute('DELETE FROM Loans WHERE id = @id AND user_id = @userId', { id, userId: user.id });
    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /loans/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
