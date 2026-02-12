import { Router, Request, Response } from 'express';
import { queryRows, queryRow, insert, execute } from '../services/database';

const router = Router();

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

function toApiFormat(row: Expense): Record<string, unknown> {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    category: row.category,
  };
}

// GET /api/expenses
router.get('/expenses', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const expenses = await queryRows<Expense>(
      'SELECT * FROM Expenses WHERE user_id = @userId ORDER BY category, name',
      { userId: user.id }
    );
    res.json(expenses.map(toApiFormat));
  } catch (error) {
    console.error('Error in GET /expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/expenses
router.post('/expenses', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const body = req.body as ExpenseInput;

    if (!body.name || body.amount === undefined || !body.category) {
      res.status(400).json({ error: 'Missing required fields: name, amount, category' });
      return;
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

    const newExpense = await queryRow<Expense>('SELECT * FROM Expenses WHERE id = @id', { id });
    res.status(201).json(newExpense ? toApiFormat(newExpense) : { id });
  } catch (error) {
    console.error('Error in POST /expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/expenses/:id
router.get('/expenses/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid expense ID' }); return; }

    const existing = await queryRow<Expense>(
      'SELECT * FROM Expenses WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Expense not found' }); return; }

    res.json(toApiFormat(existing));
  } catch (error) {
    console.error('Error in GET /expenses/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/expenses/:id
router.delete('/expenses/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid expense ID' }); return; }

    const existing = await queryRow<Expense>(
      'SELECT * FROM Expenses WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Expense not found' }); return; }

    await execute('DELETE FROM Expenses WHERE id = @id AND user_id = @userId', { id, userId: user.id });
    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /expenses/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/expenses/all
router.delete('/expenses/all', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    await execute('DELETE FROM Expenses WHERE user_id = @userId', { userId: user.id });
    res.json({ message: 'All expenses cleared' });
  } catch (error) {
    console.error('Error in DELETE /expenses/all:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
