"use server";

import { headers } from "next/headers";
import { sql, eq } from "drizzle-orm";
import { db, dbRun } from "@/lib/db/client";
import { leads, claimRequests, businessSubmissions, analyticsEvents, listings } from "@/lib/db/schema";
import { leadSchema, claimSchema, businessSubmissionSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { notifyAdmin, sendEmail } from "@/lib/email";
import { nowIso } from "@/lib/utils";
import { getListingCardsByIds } from "@/lib/queries";

export interface FormResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function clientKey(formName: string): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${formName}:${ip}`;
}

function zodFieldErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export async function submitLead(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const key = await clientKey("lead");
  if (!rateLimit(key, { limit: 5, windowMs: 10 * 60_000 }).ok) {
    return { ok: false, error: "Previše upita u kratkom vremenu. Pokušaj ponovno kasnije." };
  }
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Provjeri označena polja.", fieldErrors: zodFieldErrors(parsed.error) };
  }
  const data = parsed.data;

  await db.insert(leads).values({
    listingId: data.listingId ?? null,
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    eventDate: data.eventDate ?? null,
    eventLocation: data.eventLocation ?? null,
    eventType: data.eventType ?? null,
    message: data.message,
    createdAt: nowIso(),
  });

  await db
    .insert(analyticsEvents)
    .values({ type: "lead_submitted", listingId: data.listingId ?? null, createdAt: nowIso() });

  let listingName = "";
  if (data.listingId) {
    const listing = (await db.select().from(listings).where(eq(listings.id, data.listingId)).limit(1))[0];
    listingName = listing?.name ?? "";
    if (listing?.email) {
      await sendEmail({
        to: listing.email,
        subject: `Novi upit preko slavimo.hr — ${listing.name}`,
        text: `Ime: ${data.name}\nE-mail: ${data.email}\nTelefon: ${data.phone ?? "-"}\nDatum: ${data.eventDate ?? "-"}\nLokacija: ${data.eventLocation ?? "-"}\nVrsta događaja: ${data.eventType ?? "-"}\n\nPoruka:\n${data.message}`,
      });
    }
  }
  await notifyAdmin(
    `Novi upit${listingName ? ` — ${listingName}` : ""}`,
    `Od: ${data.name} <${data.email}>\nOglas: ${listingName || "općeniti upit"}\n\n${data.message}`
  );
  return { ok: true };
}

export async function submitClaim(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const key = await clientKey("claim");
  if (!rateLimit(key, { limit: 3, windowMs: 10 * 60_000 }).ok) {
    return { ok: false, error: "Previše zahtjeva u kratkom vremenu. Pokušaj ponovno kasnije." };
  }
  const parsed = claimSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Provjeri označena polja.", fieldErrors: zodFieldErrors(parsed.error) };
  }
  const data = parsed.data;
  const listing = (await db.select().from(listings).where(eq(listings.id, data.listingId)).limit(1))[0];
  if (!listing) return { ok: false, error: "Oglas nije pronađen." };

  await db.insert(claimRequests).values({
    listingId: data.listingId,
    fullName: data.fullName,
    email: data.email,
    phone: data.phone ?? null,
    role: data.role ?? null,
    website: data.website ?? null,
    proofMethod: data.proofMethod ?? null,
    message: data.message ?? null,
    createdAt: nowIso(),
  });

  if (listing.claimStatus === "unclaimed") {
    await db
      .update(listings)
      .set({ claimStatus: "claim_pending", updatedAt: nowIso() })
      .where(eq(listings.id, listing.id));
  }

  await db
    .insert(analyticsEvents)
    .values({ type: "claim_submitted", listingId: data.listingId, createdAt: nowIso() });

  await notifyAdmin(
    `Zahtjev za preuzimanje profila — ${listing.name}`,
    `Podnositelj: ${data.fullName} <${data.email}>\nTelefon: ${data.phone ?? "-"}\nUloga: ${data.role ?? "-"}\nDokaz: ${data.proofMethod ?? "-"}\n\n${data.message ?? ""}`
  );
  return { ok: true };
}

export async function submitBusiness(_prev: FormResult | null, formData: FormData): Promise<FormResult> {
  const key = await clientKey("business");
  if (!rateLimit(key, { limit: 3, windowMs: 10 * 60_000 }).ok) {
    return { ok: false, error: "Previše prijava u kratkom vremenu. Pokušaj ponovno kasnije." };
  }
  const parsed = businessSubmissionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Provjeri označena polja.", fieldErrors: zodFieldErrors(parsed.error) };
  }
  const data = parsed.data;

  await db.insert(businessSubmissions).values({
    businessName: data.businessName,
    contactName: data.contactName,
    email: data.email,
    phone: data.phone ?? null,
    website: data.website ?? null,
    instagram: data.instagram ?? null,
    categorySlug: data.categorySlug ?? null,
    locationName: data.locationName ?? null,
    serviceArea: data.serviceArea ?? null,
    description: data.description ?? null,
    priceFrom: data.priceFrom ?? null,
    photosUrl: data.photosUrl ?? null,
    note: data.note ?? null,
    createdAt: nowIso(),
  });

  await db
    .insert(analyticsEvents)
    .values({ type: "business_submission_completed", createdAt: nowIso() });

  await notifyAdmin(
    `Nova prijava poslovanja — ${data.businessName}`,
    `Kontakt: ${data.contactName} <${data.email}>\nKategorija: ${data.categorySlug ?? "-"}\nLokacija: ${data.locationName ?? "-"}`
  );
  return { ok: true };
}

/** First-party analitika — poziva se iz klijentskih komponenti. */
export async function trackEvent(type: string, listingId?: number, meta?: string): Promise<void> {
  const allowed = new Set([
    "search_submitted",
    "category_viewed",
    "listing_viewed",
    "favorite_added",
    "compare_added",
    "phone_clicked",
    "whatsapp_clicked",
    "email_clicked",
    "website_clicked",
    "claim_started",
    "business_submission_started",
    "partner_cta_clicked",
  ]);
  if (!allowed.has(type)) return;
  const key = await clientKey("analytics");
  if (!rateLimit(key, { limit: 60, windowMs: 60_000 }).ok) return;
  try {
    await db.insert(analyticsEvents).values({
      type,
      listingId: listingId ?? null,
      meta: meta ? meta.slice(0, 500) : null,
      createdAt: nowIso(),
    });
  } catch {
    // analitika nikad ne smije srušiti stranicu
  }
}

/** Broj pregleda oglasa — poziva se iz server komponente stranice oglasa. */
export async function recordListingView(listingId: number, path: string): Promise<void> {
  try {
    await db
      .insert(analyticsEvents)
      .values({ type: "listing_viewed", listingId, path, createdAt: nowIso() });
  } catch {
    // analitika nikad ne smije srušiti stranicu
  }
}

/** Dohvat kartica oglasa po ID-jevima — za favorite i usporedbu (localStorage). */
export async function getListingCards(ids: number[]) {
  const safe = ids.filter((n) => Number.isInteger(n) && n > 0).slice(0, 50);
  return getListingCardsByIds(safe);
}

/** Brza provjera konekcije na bazu. */
export async function pingDb(): Promise<boolean> {
  try {
    await dbRun(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}
