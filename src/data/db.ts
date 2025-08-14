import { Pool, QueryResultRow } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // e.g. postgres://user:pass@host:5432/db
  // ssl: { rejectUnauthorized: false }, // uncomment if your host requires SSL
});

export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  const res = await pool.query<T>(text, params);
  return res;
}
