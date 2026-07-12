/**
 * Runner za seed: npm run db:seed.
 * Primjenjuje shemu (scripts/schema.sql) pa puni demo podatke.
 * Zahtijeva DATABASE_URL (Supabase Postgres — vidi .env.example).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { db, sqlClient } from "../src/lib/db/client";
import { seedDatabase } from "../src/lib/db/seed";

async function main() {
  const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "schema.sql");
  const schemaSql = readFileSync(schemaPath, "utf8");
  await sqlClient.unsafe(schemaSql);
  await seedDatabase(db);
  await sqlClient.end();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await sqlClient.end();
  } catch {
    // ignore
  }
  process.exit(1);
});
