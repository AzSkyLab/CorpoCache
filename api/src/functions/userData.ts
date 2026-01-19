import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { queryRow, query } from '../services/database';
import { ensureUserInDatabase } from '../middleware/auth';

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

/**
 * Transform DB row to API response format
 */
function toApiFormat(row: UserRow | null): Record<string, unknown> {
  if (!row) {
    return {};
  }

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

/**
 * GET /api/userData - Get user data (app state)
 * PUT /api/userData - Update user data (app state)
 */
async function userDataHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);

    if (request.method === 'GET') {
      const data = await queryRow<UserRow>(
        'SELECT * FROM Users WHERE id = @userId',
        { userId: user.id }
      );

      return {
        status: 200,
        jsonBody: toApiFormat(data),
      };
    }

    if (request.method === 'PUT') {
      const body = (await request.json()) as UserDataInput;

      // Update user record
      await query(
        `UPDATE Users SET
          current_app_month = COALESCE(@currentAppMonth, current_app_month),
          current_app_year = COALESCE(@currentAppYear, current_app_year),
          updated_at = GETUTCDATE()
         WHERE id = @userId`,
        {
          userId: user.id,
          currentAppMonth: body.currentAppMonth,
          currentAppYear: body.currentAppYear,
        }
      );

      // Return updated data
      const updated = await queryRow<UserRow>(
        'SELECT * FROM Users WHERE id = @userId',
        { userId: user.id }
      );

      return {
        status: 200,
        jsonBody: toApiFormat(updated),
      };
    }

    return { status: 405, jsonBody: { error: 'Method not allowed' } };
  } catch (error) {
    context.error('Error in userData handler:', error);
    return {
      status: 500,
      jsonBody: { error: 'Internal server error' },
    };
  }
}

/**
 * GET /api/me - Get current user authentication info
 */
async function meHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await ensureUserInDatabase(request);

    return {
      status: 200,
      jsonBody: {
        id: user.id,
        provider: user.provider,
        email: user.email,
        displayName: user.displayName,
        roles: user.roles,
      },
    };
  } catch (error) {
    // Not authenticated
    return {
      status: 200,
      jsonBody: {
        authenticated: false,
      },
    };
  }
}

// Register routes
app.http('userData', {
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  route: 'userData',
  handler: userDataHandler,
});

app.http('me', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'me',
  handler: meHandler,
});
