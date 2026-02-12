import { Pool, PoolClient, QueryResultRow } from 'pg';

// Database configuration from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'corpocache',
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
});

/**
 * Convert MSSQL-style named params (@paramName) to PostgreSQL positional params ($1, $2, ...)
 * Returns the converted query string and ordered values array.
 */
function convertNamedParams(
  queryText: string,
  params?: Record<string, unknown>
): { text: string; values: unknown[] } {
  if (!params) {
    return { text: queryText, values: [] };
  }

  const paramNames: string[] = [];
  const text = queryText.replace(/@(\w+)/g, (_match, name) => {
    let idx = paramNames.indexOf(name);
    if (idx === -1) {
      paramNames.push(name);
      idx = paramNames.length - 1;
    }
    return `$${idx + 1}`;
  });

  const values = paramNames.map((name) => params[name]);
  return { text, values };
}

/**
 * Execute a parameterized query
 */
export async function query<T extends QueryResultRow>(
  queryText: string,
  params?: Record<string, unknown>
): Promise<{ rows: T[]; rowCount: number }> {
  const { text, values } = convertNamedParams(queryText, params);
  const result = await pool.query<T>(text, values);
  return { rows: result.rows, rowCount: result.rowCount ?? 0 };
}

/**
 * Execute a query and return all rows
 */
export async function queryRows<T extends QueryResultRow>(
  queryText: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const result = await query<T>(queryText, params);
  return result.rows;
}

/**
 * Execute a query and return first row or null
 */
export async function queryRow<T extends QueryResultRow>(
  queryText: string,
  params?: Record<string, unknown>
): Promise<T | null> {
  const result = await query<T>(queryText, params);
  return result.rows[0] || null;
}

/**
 * Execute an insert and return the inserted ID
 * Appends RETURNING id to the query.
 */
export async function insert(
  queryText: string,
  params?: Record<string, unknown>
): Promise<number> {
  const fullQuery = `${queryText} RETURNING id`;
  const result = await query<{ id: number }>(fullQuery, params);
  return result.rows[0]?.id || 0;
}

/**
 * Execute an update/delete and return affected rows count
 */
export async function execute(
  queryText: string,
  params?: Record<string, unknown>
): Promise<number> {
  const result = await query(queryText, params);
  return result.rowCount;
}

/**
 * Transaction helper - returns a client with BEGIN already called
 */
export async function beginTransaction(): Promise<PoolClient> {
  const client = await pool.connect();
  await client.query('BEGIN');
  return client;
}

/**
 * Execute query within a transaction
 */
export async function transactionQuery<T extends QueryResultRow>(
  client: PoolClient,
  queryText: string,
  params?: Record<string, unknown>
): Promise<{ rows: T[]; rowCount: number }> {
  const { text, values } = convertNamedParams(queryText, params);
  const result = await client.query<T>(text, values);
  return { rows: result.rows, rowCount: result.rowCount ?? 0 };
}

/**
 * Commit a transaction and release the client
 */
export async function commitTransaction(client: PoolClient): Promise<void> {
  await client.query('COMMIT');
  client.release();
}

/**
 * Rollback a transaction and release the client
 */
export async function rollbackTransaction(client: PoolClient): Promise<void> {
  await client.query('ROLLBACK');
  client.release();
}

/**
 * Ensure user exists in database (upsert)
 */
export async function ensureUser(
  userId: string,
  email?: string,
  displayName?: string
): Promise<void> {
  const existingUser = await queryRow<{ id: string }>(
    'SELECT id FROM Users WHERE id = @userId',
    { userId }
  );

  if (!existingUser) {
    await query(
      `INSERT INTO Users (id, email, display_name) VALUES (@userId, @email, @displayName)`,
      { userId, email, displayName }
    );
  } else if (email || displayName) {
    await query(
      `UPDATE Users SET
        email = COALESCE(@email, email),
        display_name = COALESCE(@displayName, display_name),
        updated_at = NOW()
       WHERE id = @userId`,
      { userId, email, displayName }
    );
  }
}

/**
 * Close the connection pool
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

/**
 * Check if database is reachable
 */
export async function checkConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

export { pool };
