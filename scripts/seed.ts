/**
 * Runner za ručni seed: npm run db:seed (ili db:reset za čistu bazu).
 * Sva logika je u src/lib/db/seed.ts kako bi je mogao koristiti i
 * runtime auto-seed (client.ts) na serverless okruženju.
 */
import { db } from "../src/lib/db/client";
import { seedDatabase } from "../src/lib/db/seed";

try {
  seedDatabase(db);
} catch (err) {
  console.error(err);
  process.exit(1);
}
