import { Router, Request, Response } from 'express';
import { queryRows, queryRow, insert, execute } from '../services/database';

const router = Router();

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

// GET /api/creditCards
router.get('/creditCards', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const cards = await queryRows<CreditCard>(
      'SELECT * FROM CreditCards WHERE user_id = @userId ORDER BY name',
      { userId: user.id }
    );
    res.json(cards.map(toApiFormat));
  } catch (error) {
    console.error('Error in GET /creditCards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/creditCards
router.post('/creditCards', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const body = req.body as CreditCardInput;

    if (!body.name || body.limit === undefined || body.dueDate === undefined) {
      res.status(400).json({ error: 'Missing required fields: name, limit, dueDate' });
      return;
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

    const newCard = await queryRow<CreditCard>('SELECT * FROM CreditCards WHERE id = @id', { id });
    res.status(201).json(newCard ? toApiFormat(newCard) : { id });
  } catch (error) {
    console.error('Error in POST /creditCards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/creditCards/:id
router.get('/creditCards/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid credit card ID' }); return; }

    const existing = await queryRow<CreditCard>(
      'SELECT * FROM CreditCards WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Credit card not found' }); return; }

    res.json(toApiFormat(existing));
  } catch (error) {
    console.error('Error in GET /creditCards/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/creditCards/:id
router.put('/creditCards/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid credit card ID' }); return; }

    const existing = await queryRow<CreditCard>(
      'SELECT * FROM CreditCards WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Credit card not found' }); return; }

    const body = req.body as Partial<CreditCardInput>;

    await execute(
      `UPDATE CreditCards SET
        name = COALESCE(@name, name),
        credit_limit = COALESCE(@limit, credit_limit),
        balance = COALESCE(@balance, balance),
        open_date = COALESCE(@openDate, open_date),
        due_date = COALESCE(@dueDate, due_date),
        custom_image = COALESCE(@customImage, custom_image),
        updated_at = NOW()
       WHERE id = @id AND user_id = @userId`,
      {
        id, userId: user.id,
        name: body.name?.trim(), limit: body.limit, balance: body.balance,
        openDate: body.openDate, dueDate: body.dueDate, customImage: body.customImage,
      }
    );

    const updated = await queryRow<CreditCard>('SELECT * FROM CreditCards WHERE id = @id', { id });
    res.json(updated ? toApiFormat(updated) : {});
  } catch (error) {
    console.error('Error in PUT /creditCards/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/creditCards/:id
router.delete('/creditCards/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid credit card ID' }); return; }

    const existing = await queryRow<CreditCard>(
      'SELECT * FROM CreditCards WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Credit card not found' }); return; }

    await execute('DELETE FROM CreditCards WHERE id = @id AND user_id = @userId', { id, userId: user.id });
    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /creditCards/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
