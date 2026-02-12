import { Router, Request, Response } from 'express';
import { queryRow, query } from '../services/database';

const router = Router();

interface UserRow {
  id: string;
  email: string | null;
  display_name: string | null;
  current_app_month: number;
  current_app_year: number;
  created_at: string;
  updated_at: string;
}

interface UserDataInput {
  currentAppMonth?: number;
  currentAppYear?: number;
}

function toApiFormat(row: UserRow | null): Record<string, unknown> {
  if (!row) return {};
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    currentAppMonth: row.current_app_month,
    currentAppYear: row.current_app_year,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/userData
router.get('/userData', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const data = await queryRow<UserRow>(
      'SELECT * FROM Users WHERE id = @userId',
      { userId: user.id }
    );
    res.json(toApiFormat(data));
  } catch (error) {
    console.error('Error in GET /userData:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/userData
router.put('/userData', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const body = req.body as UserDataInput;

    await query(
      `UPDATE Users SET
        current_app_month = COALESCE(@currentAppMonth, current_app_month),
        current_app_year = COALESCE(@currentAppYear, current_app_year),
        updated_at = NOW()
       WHERE id = @userId`,
      {
        userId: user.id,
        currentAppMonth: body.currentAppMonth,
        currentAppYear: body.currentAppYear,
      }
    );

    const updated = await queryRow<UserRow>(
      'SELECT * FROM Users WHERE id = @userId',
      { userId: user.id }
    );
    res.json(toApiFormat(updated));
  } catch (error) {
    console.error('Error in PUT /userData:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    res.json({
      id: user.id,
      provider: user.provider,
      email: user.email,
      displayName: user.displayName,
      roles: user.roles,
    });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

export default router;
