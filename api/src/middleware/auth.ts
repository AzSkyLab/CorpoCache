import { Request, Response, NextFunction } from 'express';
import { ensureUser } from '../services/database';

/**
 * Authenticated user info
 */
export interface AuthenticatedUser {
  id: string;
  provider: string;
  email: string;
  displayName: string;
  roles: string[];
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Default homelab user - single-user mode, no auth needed
 */
const HOMELAB_USER: AuthenticatedUser = {
  id: 'homelab-user',
  provider: 'local',
  email: 'user@home.lab',
  displayName: 'Homelab User',
  roles: ['authenticated'],
};

/**
 * Auth middleware - attaches default user to request
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  req.user = HOMELAB_USER;
  next();
}

/**
 * Middleware to ensure user exists in database
 */
export async function ensureUserInDatabase(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    req.user = HOMELAB_USER;
    await ensureUser(HOMELAB_USER.id, HOMELAB_USER.email, HOMELAB_USER.displayName);
    next();
  } catch (error) {
    console.error('Error ensuring user in database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
