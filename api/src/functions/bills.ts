import { Router, Request, Response } from 'express';
import { queryRows, queryRow, insert, execute } from '../services/database';

const router = Router();

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

// GET /api/bills
router.get('/bills', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const bills = await queryRows<Bill>(
      'SELECT * FROM Bills WHERE user_id = @userId ORDER BY due_date, name',
      { userId: user.id }
    );
    res.json(bills.map(toApiFormat));
  } catch (error) {
    console.error('Error in GET /bills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/bills
router.post('/bills', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const body = req.body as BillInput;

    if (!body.name || body.amount === undefined || body.dueDate === undefined) {
      res.status(400).json({ error: 'Missing required fields: name, amount, dueDate' });
      return;
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

    const newBill = await queryRow<Bill>('SELECT * FROM Bills WHERE id = @id', { id });
    res.status(201).json(newBill ? toApiFormat(newBill) : { id });
  } catch (error) {
    console.error('Error in POST /bills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bills/:id
router.get('/bills/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid bill ID' }); return; }

    const existing = await queryRow<Bill>(
      'SELECT * FROM Bills WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Bill not found' }); return; }

    res.json(toApiFormat(existing));
  } catch (error) {
    console.error('Error in GET /bills/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/bills/:id
router.put('/bills/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid bill ID' }); return; }

    const existing = await queryRow<Bill>(
      'SELECT * FROM Bills WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Bill not found' }); return; }

    const body = req.body as Partial<BillInput>;

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
        updated_at = NOW()
       WHERE id = @id AND user_id = @userId`,
      {
        id, userId: user.id,
        name: body.name?.trim(), amount: body.amount, dueDate: body.dueDate,
        type: body.type, priority: body.priority, isPaid: body.isPaid,
        varyingAmount: body.varyingAmount, autoPay: body.autoPay,
        paymentAccount: body.paymentAccount, creditCardId: body.creditCardId,
      }
    );

    const updated = await queryRow<Bill>('SELECT * FROM Bills WHERE id = @id', { id });
    res.json(updated ? toApiFormat(updated) : {});
  } catch (error) {
    console.error('Error in PUT /bills/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/bills/:id
router.delete('/bills/:id', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid bill ID' }); return; }

    const existing = await queryRow<Bill>(
      'SELECT * FROM Bills WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Bill not found' }); return; }

    await execute('DELETE FROM Bills WHERE id = @id AND user_id = @userId', { id, userId: user.id });
    res.status(204).send();
  } catch (error) {
    console.error('Error in DELETE /bills/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/bills/:id/paid
router.put('/bills/:id/paid', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid bill ID' }); return; }

    const existing = await queryRow<Bill>(
      'SELECT * FROM Bills WHERE id = @id AND user_id = @userId',
      { id, userId: user.id }
    );
    if (!existing) { res.status(404).json({ error: 'Bill not found' }); return; }

    const newPaidStatus = !existing.is_paid;
    await execute(
      `UPDATE Bills SET is_paid = @isPaid, updated_at = NOW()
       WHERE id = @id AND user_id = @userId`,
      { id, userId: user.id, isPaid: newPaidStatus }
    );

    res.json({ id, isPaid: newPaidStatus });
  } catch (error) {
    console.error('Error in PUT /bills/:id/paid:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/bills/resetPaid
router.put('/bills/resetPaid', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    await execute(
      `UPDATE Bills SET is_paid = false, updated_at = NOW() WHERE user_id = @userId`,
      { userId: user.id }
    );
    res.json({ message: 'All bills reset to unpaid' });
  } catch (error) {
    console.error('Error in PUT /bills/resetPaid:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
