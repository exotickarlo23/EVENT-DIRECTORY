import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { seedDatabase } from "./seed";

// Na serverless okruženju (Vercel) filesystem je read-only osim /tmp,
// pa tamo bazu držimo u /tmp i seedamo je demo podacima pri prvom pokretanju.
// Rezultat je preview-grade deploy (podaci nisu trajni ni dijeljeni između
// instanci); za produkciju s trajnim podacima migrirati na Postgres.
const IS_SERVERLESS = Boolean(
  process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME
);

function resolveDbPath(): string {
  const configured = process.env.DATABASE_PATH;
  if (IS_SERVERLESS) {
    // Poštuj DATABASE_PATH samo ako je već u zapisivom /tmp-u.
    return configured && configured.startsWith("/tmp") ? configured : "/tmp/festko.db";
  }
  return configured ?? "./data/festko.db";
}

const DB_PATH = resolveDbPath();

/** Treba li automatski seedati praznu bazu (serverless preview ili eksplicitni flag). */
const SHOULD_AUTOSEED = IS_SERVERLESS || process.env.FESTKO_AUTOSEED === "1";

/**
 * Bootstrap shema — izvršava se idempotentno pri otvaranju baze, tako da
 * aplikacija radi i s praznom/novom bazom (build, CI, prvi start).
 * Mora ostati usklađena sa `schema.ts`.
 */
const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT, phone TEXT, website TEXT, note TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  parent_id INTEGER,
  description TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS occasions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  county TEXT,
  kind TEXT NOT NULL DEFAULT 'city',
  lat REAL, lng REAL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  tier TEXT NOT NULL DEFAULT 'free',
  claim_status TEXT NOT NULL DEFAULT 'unclaimed',
  provider_id INTEGER,
  name TEXT NOT NULL,
  business_name TEXT,
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  primary_category_id INTEGER,
  base_location_id INTEGER,
  address TEXT, lat REAL, lng REAL,
  price_from REAL, price_to REAL,
  price_model TEXT NOT NULL DEFAULT 'on_request',
  currency TEXT NOT NULL DEFAULT 'EUR',
  phone TEXT, whatsapp TEXT, email TEXT, website TEXT, instagram TEXT, facebook TEXT,
  cover_image TEXT, video_url TEXT,
  serves_at_client_location INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT, seo_description TEXT, canonical_override TEXT,
  featured_weight INTEGER NOT NULL DEFAULT 0,
  featured_from TEXT, featured_until TEXT,
  published_at TEXT,
  data_source TEXT, internal_note TEXT,
  is_demo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(base_location_id);
CREATE TABLE IF NOT EXISTS listing_categories (
  listing_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (listing_id, category_id)
);
CREATE TABLE IF NOT EXISTS listing_occasions (
  listing_id INTEGER NOT NULL,
  occasion_id INTEGER NOT NULL,
  PRIMARY KEY (listing_id, occasion_id)
);
CREATE TABLE IF NOT EXISTS service_areas (
  listing_id INTEGER NOT NULL,
  location_id INTEGER NOT NULL,
  PRIMARY KEY (listing_id, location_id)
);
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'image',
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_from REAL, price_to REAL,
  includes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS listing_features (
  listing_id INTEGER NOT NULL,
  feature_id INTEGER NOT NULL,
  PRIMARY KEY (listing_id, feature_id)
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  text TEXT NOT NULL,
  author_name TEXT NOT NULL,
  event_date TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  is_demo INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  event_date TEXT, event_location TEXT, event_type TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS claim_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT, role TEXT, website TEXT, proof_method TEXT, message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS business_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT, website TEXT, instagram TEXT,
  category_slug TEXT, location_name TEXT, service_area TEXT,
  description TEXT, price_from TEXT, photos_url TEXT, note TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_listing_id INTEGER,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS blog_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  category_id INTEGER,
  author TEXT NOT NULL DEFAULT 'slavimo.hr tim',
  seo_title TEXT, seo_description TEXT,
  faq TEXT, related_category_slugs TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TEXT,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  listing_id INTEGER,
  path TEXT,
  meta TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(type);
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS pricing_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price REAL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  period TEXT NOT NULL DEFAULT 'mjesečno',
  description TEXT,
  features_json TEXT,
  cta_label TEXT NOT NULL DEFAULT 'Kontaktiraj nas',
  highlighted INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);
`;

/**
 * Idempotentne migracije za postojeće baze (SQLite nema ADD COLUMN IF NOT EXISTS).
 * Dodavanje stupca koji već postoji baci grešku koju ovdje ignoriramo.
 */
function runMigrations(sqlite: Database.Database): void {
  const addColumn = (table: string, colDef: string) => {
    try {
      sqlite.exec(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
    } catch {
      // stupac već postoji — u redu
    }
  };
  addColumn("blog_posts", "cover_image TEXT");
}

function createRawDb() {
  const resolved = path.resolve(process.cwd(), DB_PATH);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  const sqlite = new Database(resolved);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(BOOTSTRAP_SQL);
  runMigrations(sqlite);
  return drizzle(sqlite, { schema });
}

export type Db = ReturnType<typeof createRawDb>;

function createDb(): Db {
  const instance = createRawDb();
  if (SHOULD_AUTOSEED) {
    try {
      const row = instance.get<{ c: number }>(sql`SELECT COUNT(*) c FROM categories`);
      if (!row || row.c === 0) {
        seedDatabase(instance);
      }
    } catch (err) {
      console.error("[db] auto-seed nije uspio:", err);
    }
  }
  return instance;
}

// Jedna konekcija po procesu (Next.js hot-reload safe)
const globalForDb = globalThis as unknown as { __festkoDb?: Db };

export const db: Db = globalForDb.__festkoDb ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.__festkoDb = db;

export { schema };
