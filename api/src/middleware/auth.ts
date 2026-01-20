import { HttpRequest, HttpResponseInit } from '@azure/functions';
import { ensureUser } from '../services/database';

/**
 * Check if running in local development mode
 * Set LOCAL_DEV_MODE=true in local.settings.json to enable
 */
function isLocalDevMode(): boolean {
  return process.env.LOCAL_DEV_MODE === 'true';
}

/**
 * Mock user for local development
 */
const LOCAL_DEV_USER: AuthenticatedUser = {
  id: 'local-dev-user',
  provider: 'local',
  email: 'dev@localhost',
  displayName: 'Local Dev User',
  roles: ['authenticated', 'anonymous'],
};

/**
 * Client principal structure from Azure Static Web Apps
 */
interface ClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
  claims?: Array<{ typ: string; val: string }>;
}

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

/**
 * Parse the client principal header from Azure Static Web Apps
 */
export function parseClientPrincipal(
  request: HttpRequest
): ClientPrincipal | null {
  const header = request.headers.get('x-ms-client-principal');
  if (!header) {
    return null;
  }

  try {
    const decoded = Buffer.from(header, 'base64').toString('utf-8');
    return JSON.parse(decoded) as ClientPrincipal;
  } catch {
    console.error('Failed to parse client principal header');
    return null;
  }
}

/**
 * Get authenticated user from request
 * Returns null if not authenticated (unless in local dev mode)
 */
export function getAuthenticatedUser(
  request: HttpRequest
): AuthenticatedUser | null {
  // In local dev mode, return mock user
  if (isLocalDevMode()) {
    return LOCAL_DEV_USER;
  }

  const principal = parseClientPrincipal(request);
  if (!principal) {
    return null;
  }

  // Extract email from claims if available
  let email = principal.userDetails || '';
  let displayName = '';

  if (principal.claims) {
    for (const claim of principal.claims) {
      if (
        claim.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress' ||
        claim.typ === 'emails'
      ) {
        email = claim.val;
      }
      if (
        claim.typ === 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name' ||
        claim.typ === 'name'
      ) {
        displayName = claim.val;
      }
    }
  }

  return {
    id: principal.userId,
    provider: principal.identityProvider,
    email,
    displayName: displayName || email,
    roles: principal.userRoles,
  };
}

/**
 * Get user ID from request, throwing error if not authenticated
 */
export function requireAuth(request: HttpRequest): AuthenticatedUser {
  const user = getAuthenticatedUser(request);
  if (!user) {
    throw new AuthError('Authentication required', 401);
  }
  return user;
}

/**
 * Middleware to ensure user exists in database
 * Call this at the start of handlers that need user record
 */
export async function ensureUserInDatabase(
  request: HttpRequest
): Promise<AuthenticatedUser> {
  const user = requireAuth(request);
  await ensureUser(user.id, user.email, user.displayName);
  return user;
}

/**
 * Custom auth error class
 */
export class AuthError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message?: string): HttpResponseInit {
  return {
    status: 401,
    jsonBody: {
      error: message || 'Unauthorized. Please log in to access this resource.',
    },
  };
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(message?: string): HttpResponseInit {
  return {
    status: 403,
    jsonBody: {
      error: message || 'Forbidden. You do not have permission to access this resource.',
    },
  };
}

/**
 * Wrap handler with authentication
 */
export function withAuth<T>(
  handler: (request: HttpRequest, user: AuthenticatedUser) => Promise<T>
): (request: HttpRequest) => Promise<T | HttpResponseInit> {
  return async (request: HttpRequest) => {
    try {
      const user = requireAuth(request);
      return await handler(request, user);
    } catch (error) {
      if (error instanceof AuthError) {
        return unauthorizedResponse(error.message);
      }
      throw error;
    }
  };
}

/**
 * Wrap handler with authentication and ensure user in database
 */
export function withAuthAndUser<T>(
  handler: (request: HttpRequest, user: AuthenticatedUser) => Promise<T>
): (request: HttpRequest) => Promise<T | HttpResponseInit> {
  return async (request: HttpRequest) => {
    try {
      const user = await ensureUserInDatabase(request);
      return await handler(request, user);
    } catch (error) {
      if (error instanceof AuthError) {
        return unauthorizedResponse(error.message);
      }
      throw error;
    }
  };
}
