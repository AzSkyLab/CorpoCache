import * as sql from 'mssql';

// Database configuration from environment variables
const config: sql.config = {
  server: process.env.SQL_SERVER || '',
  database: process.env.SQL_DATABASE || 'corpocache',
  user: process.env.SQL_USER || '',
  password: process.env.SQL_PASSWORD || '',
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Alternative: use connection string if provided
const connectionString = process.env.SQL_CONNECTION_STRING;

let pool: sql.ConnectionPool | null = null;

/**
 * Get or create database connection pool
 */
export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool;
  }

  try {
    if (connectionString) {
      pool = await sql.connect(connectionString);
    } else {
      pool = await sql.connect(config);
    }
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

/**
 * Execute a parameterized query
 */
export async function query<T>(
  queryText: string,
  params?: Record<string, unknown>
): Promise<sql.IResult<T>> {
  const pool = await getPool();
  const request = pool.request();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }

  return request.query<T>(queryText);
}

/**
 * Execute a query and return all rows
 */
export async function queryRows<T>(
  queryText: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const result = await query<T>(queryText, params);
  return result.recordset;
}

/**
 * Execute a query and return first row or null
 */
export async function queryRow<T>(
  queryText: string,
  params?: Record<string, unknown>
): Promise<T | null> {
  const result = await query<T>(queryText, params);
  return result.recordset[0] || null;
}

/**
 * Execute an insert and return the inserted ID
 */
export async function insert(
  queryText: string,
  params?: Record<string, unknown>
): Promise<number> {
  const pool = await getPool();
  const request = pool.request();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }

  // Append SCOPE_IDENTITY() to get the inserted ID
  const fullQuery = `${queryText}; SELECT SCOPE_IDENTITY() AS id;`;
  const result = await request.query(fullQuery);
  return result.recordset[0]?.id || 0;
}

/**
 * Execute an update/delete and return affected rows count
 */
export async function execute(
  queryText: string,
  params?: Record<string, unknown>
): Promise<number> {
  const result = await query(queryText, params);
  return result.rowsAffected[0] || 0;
}

/**
 * Begin a transaction for multiple operations
 */
export async function beginTransaction(): Promise<sql.Transaction> {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  return transaction;
}

/**
 * Execute query within a transaction
 */
export async function transactionQuery<T>(
  transaction: sql.Transaction,
  queryText: string,
  params?: Record<string, unknown>
): Promise<sql.IResult<T>> {
  const request = new sql.Request(transaction);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }

  return request.query<T>(queryText);
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
    // Update user info if provided
    await query(
      `UPDATE Users SET
        email = COALESCE(@email, email),
        display_name = COALESCE(@displayName, display_name),
        updated_at = GETUTCDATE()
       WHERE id = @userId`,
      { userId, email, displayName }
    );
  }
}

/**
 * Close the connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

export { sql };
