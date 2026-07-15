"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, sql, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  listings,
  listingCategories,
  listingOccasions,
  serviceAreas,
  leads,
  claimRequests,
  businessSubmissions,
  categories,
  locations,
  LISTING_STATUSES,
  LISTING_TIERS,
  type ListingStatus,
  type ListingTier,
} from "@/lib/db/schema";
import {
  checkCredentials,
  createSession,
  destroySession,
  getAdminSession,
  isAdminAuthConfigured,
} from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { listingAdminSchema } from "@/lib/validation";
import { nowIso, slugify } from "@/lib/utils";
import { parseCsv } from "@/lib/csv";
import { findDuplicateCandidates } from "@/lib/admin-queries";
import { headers } from "next/headers";

async function requireAdmin(): Promise<void> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
}

function revalidatePublic(): void {
  revalidatePath("/", "layout");
}

// ---------- Auth ----------

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function adminLogin(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (!isAdminAuthConfigured()) {
    return {
      ok: false,
      error: "Admin autentikacija nije konfigurirana (AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH).",
    };
  }
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`login:${ip}`, { limit: 5, windowMs: 5 * 60_000 }).ok) {
    return { ok: false, error: "Previše pokušaja prijave. Pokušaj ponovno za nekoliko minuta." };
  }
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(email, password)) {
    return { ok: false, error: "Neispravan e-mail ili lozinka." };
  }
  await createSession(email);
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

// ---------- Oglasi ----------

function extractIds(formData: FormData, field: string): number[] {
  return formData
    .getAll(field)
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n) && n > 0);
}

export interface ListingSaveResult extends ActionResult {
  listingId?: number;
  fieldErrors?: Record<string, string>;
  duplicates?: { id: number; name: string; slug: string; reason: string }[];
}

export async function saveListing(
  listingId: number | null,
  _prev: ListingSaveResult | null,
  formData: FormData
): Promise<ListingSaveResult> {
  await requireAdmin();

  const raw = Object.fromEntries(formData) as Record<string, unknown>;
  raw.categoryIds = extractIds(formData, "categoryIds");
  raw.occasionIds = extractIds(formData, "occasionIds");
  raw.serviceAreaIds = extractIds(formData, "serviceAreaIds");
  raw.servesAtClientLocation = formData.get("servesAtClientLocation") === "on";

  const parsed = listingAdminSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Provjeri označena polja.", fieldErrors };
  }
  const data = parsed.data;

  // Slug mora biti jedinstven
  const existing = db.select().from(listings).where(eq(listings.slug, data.slug)).get();
  if (existing && existing.id !== listingId) {
    return { ok: false, error: `Slug „${data.slug}” već postoji (oglas: ${existing.name}).` };
  }

  const now = nowIso();
  const values = {
    name: data.name,
    slug: data.slug,
    status: data.status,
    tier: data.tier,
    claimStatus: data.claimStatus,
    businessName: data.businessName ?? null,
    shortDescription: data.shortDescription,
    description: data.description,
    primaryCategoryId: data.primaryCategoryId ?? null,
    baseLocationId: data.baseLocationId ?? null,
    address: data.address ?? null,
    priceFrom: data.priceFrom ?? null,
    priceTo: data.priceTo ?? null,
    priceModel: data.priceModel,
    phone: data.phone ?? null,
    whatsapp: data.whatsapp ?? null,
    email: data.email ?? null,
    website: data.website ?? null,
    instagram: data.instagram ?? null,
    facebook: data.facebook ?? null,
    coverImage: data.coverImage ?? null,
    videoUrl: data.videoUrl ?? null,
    servesAtClientLocation: data.servesAtClientLocation,
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
    canonicalOverride: data.canonicalOverride ?? null,
    featuredWeight: data.featuredWeight,
    featuredFrom: data.featuredFrom ?? null,
    featuredUntil: data.featuredUntil ?? null,
    dataSource: data.dataSource ?? null,
    internalNote: data.internalNote ?? null,
    updatedAt: now,
  };

  let id = listingId;
  if (id == null) {
    const inserted = db
      .insert(listings)
      .values({
        ...values,
        publishedAt: data.status === "published" ? now : null,
        createdAt: now,
      })
      .returning({ id: listings.id })
      .get();
    id = inserted.id;
  } else {
    const current = db.select().from(listings).where(eq(listings.id, id)).get();
    if (!current) return { ok: false, error: "Oglas nije pronađen." };
    db.update(listings)
      .set({
        ...values,
        publishedAt:
          data.status === "published" && !current.publishedAt ? now : current.publishedAt,
      })
      .where(eq(listings.id, id))
      .run();
  }

  // Junction tablice — obriši pa upiši ponovno
  db.delete(listingCategories).where(eq(listingCategories.listingId, id)).run();
  const catIds = new Set(data.categoryIds);
  if (data.primaryCategoryId) catIds.add(data.primaryCategoryId);
  for (const categoryId of catIds) {
    db.insert(listingCategories).values({ listingId: id, categoryId }).run();
  }
  db.delete(listingOccasions).where(eq(listingOccasions.listingId, id)).run();
  for (const occasionId of data.occasionIds) {
    db.insert(listingOccasions).values({ listingId: id, occasionId }).run();
  }
  db.delete(serviceAreas).where(eq(serviceAreas.listingId, id)).run();
  for (const locationId of data.serviceAreaIds) {
    db.insert(serviceAreas).values({ listingId: id, locationId }).run();
  }

  const duplicates =
    listingId == null
      ? findDuplicateCandidates({
          name: data.name,
          phone: data.phone,
          email: data.email,
          website: data.website,
          instagram: data.instagram,
          excludeId: id,
        })
      : [];

  revalidatePublic();
  return { ok: true, listingId: id, duplicates };
}

export async function setListingStatus(id: number, status: ListingStatus): Promise<void> {
  await requireAdmin();
  const current = db.select().from(listings).where(eq(listings.id, id)).get();
  if (!current) return;
  db.update(listings)
    .set({
      status,
      publishedAt: status === "published" && !current.publishedAt ? nowIso() : current.publishedAt,
      updatedAt: nowIso(),
    })
    .where(eq(listings.id, id))
    .run();
  revalidatePublic();
  revalidatePath("/admin/oglasi");
}

export async function duplicateListing(id: number): Promise<void> {
  await requireAdmin();
  const current = db.select().from(listings).where(eq(listings.id, id)).get();
  if (!current) return;
  const now = nowIso();
  let newSlug = `${current.slug}-kopija`;
  let n = 2;
  while (db.select().from(listings).where(eq(listings.slug, newSlug)).get()) {
    newSlug = `${current.slug}-kopija-${n++}`;
  }
  const inserted = db
    .insert(listings)
    .values({
      ...current,
      id: undefined,
      slug: newSlug,
      name: `${current.name} (kopija)`,
      status: "draft",
      publishedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: listings.id })
    .get();
  db.run(sql`INSERT INTO listing_categories (listing_id, category_id)
    SELECT ${inserted.id}, category_id FROM listing_categories WHERE listing_id = ${id}`);
  db.run(sql`INSERT INTO listing_occasions (listing_id, occasion_id)
    SELECT ${inserted.id}, occasion_id FROM listing_occasions WHERE listing_id = ${id}`);
  db.run(sql`INSERT INTO service_areas (listing_id, location_id)
    SELECT ${inserted.id}, location_id FROM service_areas WHERE listing_id = ${id}`);
  revalidatePath("/admin/oglasi");
}

export async function deleteListing(id: number): Promise<void> {
  await requireAdmin();
  db.delete(listingCategories).where(eq(listingCategories.listingId, id)).run();
  db.delete(listingOccasions).where(eq(listingOccasions.listingId, id)).run();
  db.delete(serviceAreas).where(eq(serviceAreas.listingId, id)).run();
  db.delete(listings).where(eq(listings.id, id)).run();
  revalidatePublic();
  revalidatePath("/admin/oglasi");
}

// ---------- Bulk (skupne) akcije nad oglasima ----------

function sanitizeIds(ids: number[]): number[] {
  return Array.from(
    new Set(ids.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n > 0))
  );
}

export interface BulkResult extends ActionResult {
  affected?: number;
}

/** Skupna promjena statusa za više oglasa odjednom. */
export async function bulkSetListingStatus(ids: number[], status: ListingStatus): Promise<BulkResult> {
  await requireAdmin();
  if (!LISTING_STATUSES.includes(status)) return { ok: false, error: "Nepoznat status." };
  const clean = sanitizeIds(ids);
  if (clean.length === 0) return { ok: false, error: "Nije odabran nijedan oglas." };
  const now = nowIso();
  db.update(listings)
    .set({
      status,
      publishedAt:
        status === "published"
          ? sql`COALESCE(${listings.publishedAt}, ${now})`
          : sql`${listings.publishedAt}`,
      updatedAt: now,
    })
    .where(inArray(listings.id, clean))
    .run();
  revalidatePublic();
  revalidatePath("/admin/oglasi");
  return { ok: true, affected: clean.length };
}

/** Skupna promjena tiera (free / featured). */
export async function bulkSetListingTier(ids: number[], tier: ListingTier): Promise<BulkResult> {
  await requireAdmin();
  if (!LISTING_TIERS.includes(tier)) return { ok: false, error: "Nepoznat tier." };
  const clean = sanitizeIds(ids);
  if (clean.length === 0) return { ok: false, error: "Nije odabran nijedan oglas." };
  db.update(listings)
    .set({ tier, updatedAt: nowIso() })
    .where(inArray(listings.id, clean))
    .run();
  revalidatePublic();
  revalidatePath("/admin/oglasi");
  return { ok: true, affected: clean.length };
}

/** Skupna promjena primarne kategorije. Ažurira i junction tablicu. */
export async function bulkSetPrimaryCategory(ids: number[], categoryId: number): Promise<BulkResult> {
  await requireAdmin();
  const clean = sanitizeIds(ids);
  if (clean.length === 0) return { ok: false, error: "Nije odabran nijedan oglas." };
  const cat = db.select().from(categories).where(eq(categories.id, categoryId)).get();
  if (!cat) return { ok: false, error: "Nepoznata kategorija." };
  db.update(listings)
    .set({ primaryCategoryId: categoryId, updatedAt: nowIso() })
    .where(inArray(listings.id, clean))
    .run();
  // Osiguraj da je nova primarna kategorija i u junction tablici.
  for (const id of clean) {
    const exists = db
      .select()
      .from(listingCategories)
      .where(sql`${listingCategories.listingId} = ${id} AND ${listingCategories.categoryId} = ${categoryId}`)
      .get();
    if (!exists) db.insert(listingCategories).values({ listingId: id, categoryId }).run();
  }
  revalidatePublic();
  revalidatePath("/admin/oglasi");
  return { ok: true, affected: clean.length };
}

/** Skupna promjena bazne lokacije. */
export async function bulkSetBaseLocation(ids: number[], locationId: number): Promise<BulkResult> {
  await requireAdmin();
  const clean = sanitizeIds(ids);
  if (clean.length === 0) return { ok: false, error: "Nije odabran nijedan oglas." };
  const loc = db.select().from(locations).where(eq(locations.id, locationId)).get();
  if (!loc) return { ok: false, error: "Nepoznata lokacija." };
  db.update(listings)
    .set({ baseLocationId: locationId, updatedAt: nowIso() })
    .where(inArray(listings.id, clean))
    .run();
  revalidatePublic();
  revalidatePath("/admin/oglasi");
  return { ok: true, affected: clean.length };
}

/** Skupno brisanje oglasa (uključujući junction zapise). */
export async function bulkDeleteListings(ids: number[]): Promise<BulkResult> {
  await requireAdmin();
  const clean = sanitizeIds(ids);
  if (clean.length === 0) return { ok: false, error: "Nije odabran nijedan oglas." };
  db.delete(listingCategories).where(inArray(listingCategories.listingId, clean)).run();
  db.delete(listingOccasions).where(inArray(listingOccasions.listingId, clean)).run();
  db.delete(serviceAreas).where(inArray(serviceAreas.listingId, clean)).run();
  db.delete(listings).where(inArray(listings.id, clean)).run();
  revalidatePublic();
  revalidatePath("/admin/oglasi");
  return { ok: true, affected: clean.length };
}

// ---------- Upiti / zahtjevi ----------

export async function setLeadStatus(id: number, status: string): Promise<void> {
  await requireAdmin();
  if (!["new", "read", "archived"].includes(status)) return;
  db.update(leads).set({ status }).where(eq(leads.id, id)).run();
  revalidatePath("/admin/upiti");
}

export async function setClaimStatus(id: number, status: string, adminNote?: string): Promise<void> {
  await requireAdmin();
  if (!["pending", "under_review", "approved", "rejected"].includes(status)) return;
  const claim = db.select().from(claimRequests).where(eq(claimRequests.id, id)).get();
  if (!claim) return;
  db.update(claimRequests)
    .set({ status: status as "pending", adminNote: adminNote ?? claim.adminNote })
    .where(eq(claimRequests.id, id))
    .run();
  if (status === "approved") {
    db.update(listings)
      .set({ claimStatus: "claimed", updatedAt: nowIso() })
      .where(eq(listings.id, claim.listingId))
      .run();
  } else if (status === "rejected") {
    const other = db.get<{ c: number }>(
      sql`SELECT COUNT(*) c FROM claim_requests WHERE listing_id = ${claim.listingId} AND status IN ('pending','under_review') AND id != ${id}`
    );
    if (!other || other.c === 0) {
      db.update(listings)
        .set({ claimStatus: "unclaimed", updatedAt: nowIso() })
        .where(eq(listings.id, claim.listingId))
        .run();
    }
  }
  revalidatePublic();
  revalidatePath("/admin/zahtjevi-za-preuzimanje");
}

export async function setSubmissionStatus(id: number, status: string): Promise<void> {
  await requireAdmin();
  if (!["pending", "under_review", "approved", "rejected"].includes(status)) return;
  db.update(businessSubmissions)
    .set({ status: status as "pending" })
    .where(eq(businessSubmissions.id, id))
    .run();
  revalidatePath("/admin/prijave-poslovanja");
}

/** Iz prijave poslovanja kreira draft oglas (bez ponovnog upisivanja podataka). */
export async function createListingFromSubmission(submissionId: number): Promise<void> {
  await requireAdmin();
  const sub = db.select().from(businessSubmissions).where(eq(businessSubmissions.id, submissionId)).get();
  if (!sub || sub.createdListingId) return;

  const category = sub.categorySlug
    ? db.select().from(categories).where(eq(categories.slug, sub.categorySlug)).get()
    : undefined;
  const location = sub.locationName
    ? db.select().from(locations).where(eq(locations.slug, slugify(sub.locationName))).get()
    : undefined;

  let slug = slugify(sub.businessName);
  let n = 2;
  while (db.select().from(listings).where(eq(listings.slug, slug)).get()) {
    slug = `${slugify(sub.businessName)}-${n++}`;
  }
  const now = nowIso();
  const priceFrom = sub.priceFrom ? Number(sub.priceFrom.replace(/[^\d.,]/g, "").replace(",", ".")) : NaN;
  const inserted = db
    .insert(listings)
    .values({
      slug,
      name: sub.businessName,
      businessName: sub.businessName,
      status: "draft",
      claimStatus: "claimed",
      shortDescription: (sub.description ?? "").slice(0, 200),
      description: sub.description ?? "",
      primaryCategoryId: category?.id ?? null,
      baseLocationId: location?.id ?? null,
      priceFrom: Number.isFinite(priceFrom) ? priceFrom : null,
      priceModel: Number.isFinite(priceFrom) ? "from" : "on_request",
      phone: sub.phone ?? null,
      email: sub.email,
      website: sub.website ?? null,
      instagram: sub.instagram ?? null,
      dataSource: `Prijava poslovanja #${sub.id}`,
      createdAt: now,
      updatedAt: now,
    })
    .returning({ id: listings.id })
    .get();
  if (category) {
    db.insert(listingCategories).values({ listingId: inserted.id, categoryId: category.id }).run();
  }
  db.update(businessSubmissions)
    .set({ status: "approved", createdListingId: inserted.id })
    .where(eq(businessSubmissions.id, submissionId))
    .run();
  revalidatePath("/admin/prijave-poslovanja");
  redirect(`/admin/oglasi/${inserted.id}`);
}

// ---------- CSV import ----------

export interface CsvPreviewRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
  duplicates: { id: number; name: string; reason: string }[];
}

export interface CsvPreviewResult extends ActionResult {
  header?: string[];
  rows?: CsvPreviewRow[];
}

const REQUIRED_CSV = ["name", "category_slug", "location_slug"];

export async function previewCsvImport(_prev: CsvPreviewResult | null, formData: FormData): Promise<CsvPreviewResult> {
  await requireAdmin();
  const file = formData.get("file");
  const pasted = String(formData.get("csv_text") ?? "");
  let text = pasted;
  if (file instanceof File && file.size > 0) {
    if (file.size > 2 * 1024 * 1024) return { ok: false, error: "CSV datoteka je veća od 2 MB." };
    text = await file.text();
  }
  if (!text.trim()) return { ok: false, error: "Priloži CSV datoteku ili zalijepi sadržaj." };

  const parsed = parseCsv(text);
  if (parsed.length < 2) return { ok: false, error: "CSV mora imati header i barem jedan redak podataka." };

  const header = (parsed[0] ?? []).map((h) => h.trim().toLowerCase());
  const missing = REQUIRED_CSV.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    return { ok: false, error: `Nedostaju obavezni stupci: ${missing.join(", ")}` };
  }

  const rows: CsvPreviewRow[] = parsed.slice(1, 201).map((cells, i) => {
    const data: Record<string, string> = {};
    header.forEach((h, j) => {
      data[h] = (cells[j] ?? "").trim();
    });
    const errors: string[] = [];
    if (!data.name) errors.push("Nedostaje naziv");
    if (data.category_slug) {
      const cat = db.select().from(categories).where(eq(categories.slug, data.category_slug)).get();
      if (!cat) errors.push(`Nepoznata kategorija: ${data.category_slug}`);
    } else {
      errors.push("Nedostaje category_slug");
    }
    if (data.location_slug) {
      const loc = db.select().from(locations).where(eq(locations.slug, data.location_slug)).get();
      if (!loc) errors.push(`Nepoznata lokacija: ${data.location_slug}`);
    } else {
      errors.push("Nedostaje location_slug");
    }
    if (data.price_from && Number.isNaN(Number(data.price_from))) errors.push("price_from nije broj");
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push("Neispravan e-mail");
    const duplicates = data.name
      ? findDuplicateCandidates({
          name: data.name,
          phone: data.phone,
          email: data.email,
          website: data.website,
          instagram: data.instagram,
        }).map((d) => ({ id: d.id, name: d.name, reason: d.reason }))
      : [];
    return { rowNumber: i + 2, data, errors, duplicates };
  });

  return { ok: true, header, rows };
}

export interface CsvImportResult extends ActionResult {
  imported?: number;
  skipped?: number;
}

export async function confirmCsvImport(_prev: CsvImportResult | null, formData: FormData): Promise<CsvImportResult> {
  await requireAdmin();
  const payload = String(formData.get("rows_json") ?? "");
  const publish = formData.get("publish") === "on";
  let rows: Record<string, string>[];
  try {
    rows = JSON.parse(payload) as Record<string, string>[];
  } catch {
    return { ok: false, error: "Neispravan payload za import." };
  }
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: "Nema redaka za import." };
  if (rows.length > 200) return { ok: false, error: "Maksimalno 200 redaka po importu." };

  let imported = 0;
  let skipped = 0;
  const now = nowIso();

  for (const data of rows) {
    const name = (data.name ?? "").trim();
    const category = data.category_slug
      ? db.select().from(categories).where(eq(categories.slug, data.category_slug)).get()
      : undefined;
    const location = data.location_slug
      ? db.select().from(locations).where(eq(locations.slug, data.location_slug)).get()
      : undefined;
    if (!name || !category || !location) {
      skipped++;
      continue;
    }
    let slug = slugify(name);
    let n = 2;
    while (db.select().from(listings).where(eq(listings.slug, slug)).get()) {
      slug = `${slugify(name)}-${n++}`;
    }
    const priceFrom = data.price_from ? Number(data.price_from) : NaN;
    const priceTo = data.price_to ? Number(data.price_to) : NaN;
    const priceModel = ["from", "range", "fixed", "on_request"].includes(data.price_model ?? "")
      ? (data.price_model as "from")
      : Number.isFinite(priceFrom)
        ? "from"
        : "on_request";
    const inserted = db
      .insert(listings)
      .values({
        slug,
        name,
        businessName: data.business_name || name,
        status: publish ? "published" : "draft",
        shortDescription: (data.short_description ?? "").slice(0, 300),
        description: data.description ?? "",
        primaryCategoryId: category.id,
        baseLocationId: location.id,
        address: data.address || null,
        priceFrom: Number.isFinite(priceFrom) ? priceFrom : null,
        priceTo: Number.isFinite(priceTo) ? priceTo : null,
        priceModel,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        website: data.website || null,
        instagram: data.instagram || null,
        facebook: data.facebook || null,
        dataSource: data.data_source || "CSV import",
        publishedAt: publish ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: listings.id })
      .get();
    db.insert(listingCategories).values({ listingId: inserted.id, categoryId: category.id }).run();
    // occasions: "djecji-rodendan|vjencanje"
    for (const occSlug of (data.occasions ?? "").split("|").map((s) => s.trim()).filter(Boolean)) {
      const occ = db.get<{ id: number }>(sql`SELECT id FROM occasions WHERE slug = ${occSlug}`);
      if (occ) db.insert(listingOccasions).values({ listingId: inserted.id, occasionId: occ.id }).run();
    }
    for (const areaSlug of (data.service_areas ?? "").split("|").map((s) => s.trim()).filter(Boolean)) {
      const loc = db.get<{ id: number }>(sql`SELECT id FROM locations WHERE slug = ${areaSlug}`);
      if (loc) db.insert(serviceAreas).values({ listingId: inserted.id, locationId: loc.id }).run();
    }
    imported++;
  }
  revalidatePublic();
  revalidatePath("/admin/oglasi");
  return { ok: true, imported, skipped };
}
