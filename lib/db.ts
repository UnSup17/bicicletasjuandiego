// ============================================================
//  lib/db.ts — MySQL2 Connection Pool Singleton
//  Compatible con Next.js Hot Reload (evita connection flood)
// ============================================================

import mysql from 'mysql2/promise';

declare global {
  // eslint-disable-next-line no-var
  var _mysqlPool: mysql.Pool | undefined;
}

const getPool = (): mysql.Pool => {
  if (global._mysqlPool) {
    return global._mysqlPool;
  }

  const pool = mysql.createPool({
    host:               process.env.DB_HOST     || 'localhost',
    port:               Number(process.env.DB_PORT) || 3306,
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    database:           process.env.DB_NAME     || 'bicicletasjuandiego',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    charset:            'utf8mb4',
    timezone:           'Z',
    decimalNumbers:     true,
  });

  // En desarrollo, guardamos en global para evitar re-crear el pool en cada hot-reload
  if (process.env.NODE_ENV !== 'production') {
    global._mysqlPool = pool;
  }

  return pool;
};

const pool = getPool();

export default pool;

// Helper tipado para queries
export async function query<T = unknown>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T[]> {
  const [rows] = await pool.execute<mysql.RowDataPacket[]>(sql, params);
  return rows as T[];
}

// Helper para un solo resultado
export async function queryOne<T = unknown>(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

// Helper para INSERT/UPDATE/DELETE
export async function execute(
  sql: string,
  params?: (string | number | boolean | null)[]
): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(sql, params);
  return result;
}
