import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { SQL } from "drizzle-orm";
import * as schema from "./schema";

/**
 * Supabase Postgres konekcija (postgres-js + Drizzle).
 * `DATABASE_URL` je OBAVEZAN — koristi Supabase „Transaction pooler" connection
 * string (port 6543) za serverless (Vercel/Netlify). Vidi .env.example / README.
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL nije postavljen. Postavi Supabase Postgres connection string (vidi .env.example)."
  );
}

// Jedna konekcija po procesu (Next.js hot-reload / serverless safe).
const globalForDb = globalThis as unknown as {
  __sqlClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__sqlClient ??
  postgres(connectionString, {
    prepare: false, // nužno za Supabase transaction pooler
    max: process.env.NODE_ENV === "production" ? 1 : 5,
  });
if (process.env.NODE_ENV !== "production") globalForDb.__sqlClient = client;

export const db = drizzle(client, { schema });
export type Db = typeof db;
export { schema };
export { client as sqlClient };

/** Raw SQL helperi — vraćaju retke (postgres-js `execute` vraća polje redaka). */
export async function dbAll<T>(query: SQL): Promise<T[]> {
  const rows = await db.execute(query);
  return rows as unknown as T[];
}

export async function dbGet<T>(query: SQL): Promise<T | undefined> {
  const rows = await db.execute(query);
  return (rows as unknown as T[])[0];
}

export async function dbRun(query: SQL): Promise<void> {
  await db.execute(query);
}
