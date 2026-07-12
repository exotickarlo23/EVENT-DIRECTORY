# slavimo.hr — Sve za događaj koji se pamti.

Katalog i tražilica event-usluga u Hrvatskoj: napuhanci, animatori, photobooth, catering,
prostori, dekoracije, glazba, fotografi i oprema — na jednom mjestu. Freemium directory
model: besplatni oglasi + plaćeni istaknuti oglasi, s administratorskim backendom za
upravljanje sadržajem.

## Stack

- **Next.js 16** (App Router, server components, server actions)
- **TypeScript** (strict + noUncheckedIndexedAccess)
- **Tailwind CSS 4** (semantički design tokeni u `globals.css` — `@theme`)
- **Drizzle ORM + better-sqlite3** (lokalna SQLite baza, bez vanjskih servisa)
- **Zod** (server-side validacija svih formi)
- **Lucide** ikone, **Fraunces + Manrope** preko `next/font`
- **Playwright** e2e testovi

> **Zašto SQLite, a ne Supabase?** MVP radi bez ijednog vanjskog credentiala —
> kloniraj, seedaj, pokreni. Model podataka (`src/lib/db/schema.ts`) pisan je
> portabilno; migracija na Postgres/Supabase svodi se na zamjenu drivera u
> `src/lib/db/client.ts` i prepis bootstrap SQL-a. Vidi „Faza 2".

## Lokalno pokretanje

```bash
npm install
npm run db:seed      # kreira data/festko.db i puni demo podacima
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run db:seed
npm run build
npm run start
```

Ostale naredbe: `npm run lint`, `npm run typecheck`, `npm run db:reset` (čista baza +
seed), `npm run test:e2e` (Playwright; pokreće vlastiti server s test-only admin
kredencijalima).

## Environment varijable

Kopiraj `.env.example` u `.env` i popuni. Ključno:

| Varijabla | Obavezno | Opis |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | produkcija | Javni URL (canonical, sitemap, OG) |
| `AUTH_SECRET` | produkcija | Min. 32 znaka, potpisivanje admin sessiona |
| `ADMIN_EMAIL` | produkcija | E-mail administratora |
| `ADMIN_PASSWORD_HASH` | produkcija | `scrypt:<salt>:<hash>` — naredba za generiranje je u `.env.example` |
| `DATABASE_PATH` | ne | Putanja SQLite datoteke (default `./data/festko.db`) |
| `EMAIL_PROVIDER` | ne | `console` (default, samo logira) ili `resend` |
| `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL` | ne | E-mail obavijesti o upitima/zahtjevima |

**Admin je fail-closed**: u produkciji bez `AUTH_SECRET` + `ADMIN_EMAIL` +
`ADMIN_PASSWORD_HASH` prijava nije moguća. U developmentu (bez postavljenih varijabli)
vrijedi fallback `admin@festko.local` / `festko-dev` — nikad u produkciji.

## Administratorsko sučelje

`/admin` (login na `/admin/login`). Mogućnosti:

- **Dashboard** — stvarne metrike iz baze (oglasi, upiti, pregledi, klikovi)
- **Oglasi** — CRUD: draft/objava/pauza/arhiva, dupliciranje, brisanje uz potvrdu,
  istaknuti status (tier, težina, od–do datumi), kategorije, prigode, područje usluge,
  cijene, kontakti, SEO polja, interna napomena; upozorenje na moguće duplikate
  (naziv/telefon/e-mail/domena/Instagram)
- **Upiti** — pregled leadova, statusi (novo/pročitano/arhivirano)
- **Zahtjevi za preuzimanje** — odobri/odbij; odobrenje postavlja oglas na „preuzet"
- **Prijave poslovanja** — jednim klikom kreira draft oglas iz prijave
- **CSV import** — upload ili paste, preview s validacijom po retku i detekcijom
  duplikata, uvoz kao draft ili objavljeno (max 200 redaka)

### CSV format

Obavezni stupci: `name`, `category_slug`, `location_slug`. Podržani:
`business_name, short_description, description, price_from, price_to, price_model,
phone, whatsapp, email, website, instagram, facebook, address, occasions,
service_areas, data_source`. Višestruke vrijednosti (occasions, service_areas)
odvajaju se znakom `|`, npr. `djecji-rodendan|vjencanje`.

## Kako promijeniti naziv/brend

Sve na jednom mjestu: **`src/config/site.ts`** (naziv, tagline, kontakti, društvene
mreže, pravni podaci). Boje/tokeni: `src/app/globals.css` (`@theme`). Logotip
(privremeni wordmark + iskra): `src/components/logo.tsx` i `src/app/icon.svg`.

## Dodavanje kategorija, lokacija, prigoda i članaka

U MVP-u se taksonomije i članci dodaju kroz seed (`scripts/seed.ts`) ili izravno u
bazu (tablice `categories`, `locations`, `occasions`, `blog_posts`). Admin ih
prikazuje read-only; CRUD sučelje je u backlogu faze 2.

## SEO arhitektura

- URL struktura: `/usluge/[kategorija]`, `/usluge/[kategorija]/[lokacija]` (glavni
  SEO motor), `/prigode/[prigoda]`, `/prigode/[prigoda]/[lokacija]`,
  `/lokacije/[grad]`, `/vodici/[slug]`
- **Kanonski URL oglasa** je hijerarhijski: `/usluge/[kategorija]/[lokacija]/[ime]`,
  automatski izveden iz oglasa (primarna kategorija + sjedište + slug imena).
  Slug ostaje jedinstveni ključ pa se svaka druga kombinacija kategorije/lokacije
  (i naslijeđeni `/ponudaci/[slug]`) trajno (301) preusmjerava na kanonski put —
  linkovi se ne lome kad se promijeni kategorija ili lokacija (samo promjena
  imena/sluga zahtijeva ručni redirect, backlog faze 2).
- Jedinstveni title/description/canonical po stranici (Metadata API)
- **Zaštita od SEO spama**: category×location stranice bez oglasa su `noindex`;
  filtrirane/paginirane varijante su `noindex` s canonicalom na čistu rutu; sitemap
  sadrži samo kombinacije sa stvarnim oglasima
- Structured data: Organization, WebSite+SearchAction, BreadcrumbList, ItemList,
  LocalBusiness (+AggregateRating samo uz stvarne recenzije), FAQPage, Article
- `robots.txt` + dinamički `sitemap.xml` (158 URL-ova s demo podacima)
- Interni linkovi: kategorija ↔ lokacija ↔ prigoda ↔ vodiči ↔ srodni oglasi

## Analitika

First-party eventi u tablici `analytics_events` (pregledi oglasa, klikovi na
telefon/WhatsApp/e-mail, pretrage, favoriti, poslani obrasci…) — bez vanjskih servisa,
prikazano na admin dashboardu. Adapter za vanjsku analitiku moguće dodati bez
blokiranja stranice.

## Sigurnost

- Admin session: HMAC-potpisani httpOnly cookie (12 h), scrypt hash lozinke,
  rate-limit na login (5/5 min), fail-closed u produkciji
- Middleware + server-side guard u layoutu + `requireAdmin()` u svakoj admin akciji
- Sve javne forme: Zod validacija na serveru, honeypot polje, in-memory rate limiting
  po IP-u, privola za privatnost
- Slike kroz `next/image`; nema service-role ključeva; tajne samo u env varijablama

## Demo podaci

Seed puni **izmišljena demo poslovanja** (`is_demo = 1`, jasno označena bedžem „Demo"
na stranici oglasa): 18 kategorija + podkategorije (37 ukupno), 12 lokacija, 16
prigoda, 23 oglasa (6 istaknutih, nekoliko nepreuzetih profila, različiti modeli
cijena, paketi), 3 vodiča s FAQ-om, 2 pricing plana. Oglasi bez fotografija koriste
brendirani placeholder (gradijent + ikona kategorije) — namjerno bez tuđih
fotografija. **Prije produkcije**: pokreni čistu bazu bez demo oglasa ili ih obriši u
adminu.

## Testiranje

- `npm run test:e2e` — 6 Playwright testova: naslovnica, kategorija→lokacija→oglas,
  favoriti, slanje upita, claim forma, puni admin flow (login → draft → objava →
  javna vidljivost). U ovom okruženju koristi preinstalirani Chromium
  (`/opt/pw-browsers/chromium`); lokalno pokreni `npx playwright install` i po
  potrebi ukloni `launchOptions` iz `playwright.config.ts`.
- `npm run lint` i `npm run typecheck` — čisto.

## Što je implementirano

Javni dio (naslovnica s pretragom, sve taksonomijske stranice, detaljni profili s
lead formom i sticky mobilnim CTA-om, favoriti + usporedba bez računa, vodiči,
partner stranice, cjenik iz baze, prijava poslovanja, preuzimanje profila, pravne
stranice, 404, empty/error stanja), admin (dashboard, CRUD oglasa, upiti, zahtjevi,
prijave, CSV import), tehnički SEO, first-party analitika, sigurna autentikacija,
seed, e2e testovi.

## Faza 2 — backlog (namjerno NIJE implementirano)

- Provider registracija i prijava; claim verifikacija poslovnim e-mailom/domenom
- Provider dashboard i samostalno uređivanje profila
- Stripe/online naplata, mjesečne i godišnje pretplate, automatski featured status,
  automatski računi
- Upload i drag-and-drop sortiranje galerije u adminu (sada: URL polja)
- CRUD za kategorije/lokacije/prigode/članke kroz admin sučelje
- Recenzije: javna forma za unos + moderacija (model i prikaz postoje, unos je
  namjerno isključen dok nema moderacije)
- Statistika za ponuđače, više članova tima, kalendar dostupnosti, odgovaranje na
  leadove iz sučelja
- Migracija na Postgres/Supabase (upute gore), Redis rate-limiting kod skaliranja
- Verifikacijske značke; native aplikacija samo ako se pokaže potreba
