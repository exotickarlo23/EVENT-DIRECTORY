import "server-only";
import { sql, desc, eq, asc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  listings,
  businessSubmissions,
  categories,
  locations,
  occasions,
  blogPosts,
  type Listing,
  type Lead,
  type ClaimRequest,
  type BusinessSubmission,
} from "@/lib/db/schema";

export interface DashboardStats {
  totalPublished: number;
  freeCount: number;
  featuredCount: number;
  featuredExpiringSoon: number;
  newLeads: number;
  pendingClaims: number;
  pendingSubmissions: number;
  listingViews: number;
  phoneClicks: number;
  whatsappClicks: number;
  leadsSubmitted: number;
}

export function getDashboardStats(): DashboardStats {
  const one = (q: ReturnType<typeof sql>) => db.get<{ c: number }>(q)?.c ?? 0;
  return {
    totalPublished: one(sql`SELECT COUNT(*) c FROM listings WHERE status = 'published'`),
    freeCount: one(sql`SELECT COUNT(*) c FROM listings WHERE status = 'published' AND tier = 'free'`),
    featuredCount: one(sql`SELECT COUNT(*) c FROM listings WHERE status = 'published' AND tier = 'featured'`),
    featuredExpiringSoon: one(sql`
      SELECT COUNT(*) c FROM listings
      WHERE tier = 'featured' AND featured_until IS NOT NULL
        AND featured_until BETWEEN datetime('now') AND datetime('now', '+14 days')
    `),
    newLeads: one(sql`SELECT COUNT(*) c FROM leads WHERE status = 'new'`),
    pendingClaims: one(sql`SELECT COUNT(*) c FROM claim_requests WHERE status IN ('pending','under_review')`),
    pendingSubmissions: one(sql`SELECT COUNT(*) c FROM business_submissions WHERE status IN ('pending','under_review')`),
    listingViews: one(sql`SELECT COUNT(*) c FROM analytics_events WHERE type = 'listing_viewed'`),
    phoneClicks: one(sql`SELECT COUNT(*) c FROM analytics_events WHERE type = 'phone_clicked'`),
    whatsappClicks: one(sql`SELECT COUNT(*) c FROM analytics_events WHERE type = 'whatsapp_clicked'`),
    leadsSubmitted: one(sql`SELECT COUNT(*) c FROM analytics_events WHERE type = 'lead_submitted'`),
  };
}

export interface AdminListingRow extends Listing {
  categoryName: string | null;
  locationName: string | null;
  leadCount: number;
  viewCount: number;
}

export function getAdminListings(filter?: { status?: string; q?: string }): AdminListingRow[] {
  const conds = [sql`1=1`];
  if (filter?.status) conds.push(sql`l.status = ${filter.status}`);
  if (filter?.q) {
    const like = `%${filter.q}%`;
    conds.push(sql`(l.name LIKE ${like} OR l.slug LIKE ${like} OR l.business_name LIKE ${like})`);
  }
  const rows = db.all<Record<string, unknown>>(sql`
    SELECT l.*, c.name AS categoryName, loc.name AS locationName,
      (SELECT COUNT(*) FROM leads ld WHERE ld.listing_id = l.id) AS leadCount,
      (SELECT COUNT(*) FROM analytics_events ae WHERE ae.listing_id = l.id AND ae.type = 'listing_viewed') AS viewCount
    FROM listings l
    LEFT JOIN categories c ON c.id = l.primary_category_id
    LEFT JOIN locations loc ON loc.id = l.base_location_id
    WHERE ${sql.join(conds, sql` AND `)}
    ORDER BY l.updated_at DESC
  `);
  return rows.map((r) => ({
    ...(mapListingRow(r) as Listing),
    categoryName: (r.categoryName as string) ?? null,
    locationName: (r.locationName as string) ?? null,
    leadCount: Number(r.leadCount ?? 0),
    viewCount: Number(r.viewCount ?? 0),
  }));
}

export function mapListingRow(r: Record<string, unknown>): Listing {
  return {
    id: r.id,
    slug: r.slug,
    status: r.status,
    tier: r.tier,
    claimStatus: r.claim_status,
    providerId: r.provider_id,
    name: r.name,
    businessName: r.business_name,
    shortDescription: r.short_description,
    description: r.description,
    primaryCategoryId: r.primary_category_id,
    baseLocationId: r.base_location_id,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    priceFrom: r.price_from,
    priceTo: r.price_to,
    priceModel: r.price_model,
    currency: r.currency,
    phone: r.phone,
    whatsapp: r.whatsapp,
    email: r.email,
    website: r.website,
    instagram: r.instagram,
    facebook: r.facebook,
    coverImage: r.cover_image,
    videoUrl: r.video_url,
    servesAtClientLocation: r.serves_at_client_location === 1,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    canonicalOverride: r.canonical_override,
    featuredWeight: r.featured_weight,
    featuredFrom: r.featured_from,
    featuredUntil: r.featured_until,
    publishedAt: r.published_at,
    dataSource: r.data_source,
    internalNote: r.internal_note,
    isDemo: r.is_demo === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  } as Listing;
}

export function getAdminListingById(id: number): (Listing & {
  categoryIds: number[];
  occasionIds: number[];
  serviceAreaIds: number[];
}) | null {
  const listing = db.select().from(listings).where(eq(listings.id, id)).get();
  if (!listing) return null;
  const categoryIds = db
    .all<{ category_id: number }>(sql`SELECT category_id FROM listing_categories WHERE listing_id = ${id}`)
    .map((r) => r.category_id);
  const occasionIds = db
    .all<{ occasion_id: number }>(sql`SELECT occasion_id FROM listing_occasions WHERE listing_id = ${id}`)
    .map((r) => r.occasion_id);
  const serviceAreaIds = db
    .all<{ location_id: number }>(sql`SELECT location_id FROM service_areas WHERE listing_id = ${id}`)
    .map((r) => r.location_id);
  return { ...listing, categoryIds, occasionIds, serviceAreaIds };
}

export function getAdminLeads(): (Lead & { listingName: string | null })[] {
  const rows = db.all<Record<string, unknown>>(sql`
    SELECT ld.*, l.name AS listingName FROM leads ld
    LEFT JOIN listings l ON l.id = ld.listing_id
    ORDER BY ld.created_at DESC
  `);
  return rows.map((r) => ({
    id: r.id,
    listingId: r.listing_id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    eventDate: r.event_date,
    eventLocation: r.event_location,
    eventType: r.event_type,
    message: r.message,
    status: r.status,
    createdAt: r.created_at,
    listingName: (r.listingName as string) ?? null,
  })) as (Lead & { listingName: string | null })[];
}

export function getAdminClaims(): (ClaimRequest & { listingName: string | null; listingSlug: string | null })[] {
  const rows = db.all<Record<string, unknown>>(sql`
    SELECT cr.*, l.name AS listingName, l.slug AS listingSlug FROM claim_requests cr
    LEFT JOIN listings l ON l.id = cr.listing_id
    ORDER BY cr.created_at DESC
  `);
  return rows.map((r) => ({
    id: r.id,
    listingId: r.listing_id,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    role: r.role,
    website: r.website,
    proofMethod: r.proof_method,
    message: r.message,
    status: r.status,
    adminNote: r.admin_note,
    createdAt: r.created_at,
    listingName: (r.listingName as string) ?? null,
    listingSlug: (r.listingSlug as string) ?? null,
  })) as (ClaimRequest & { listingName: string | null; listingSlug: string | null })[];
}

export function getAdminSubmissions(): BusinessSubmission[] {
  return db.select().from(businessSubmissions).orderBy(desc(businessSubmissions.createdAt)).all();
}

export function getAllCategoriesFlat() {
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)).all();
}

export function getAllLocations() {
  return db.select().from(locations).orderBy(asc(locations.sortOrder), asc(locations.name)).all();
}

export function getAllOccasions() {
  return db.select().from(occasions).orderBy(asc(occasions.sortOrder)).all();
}

export function getAllPosts() {
  return db.select().from(blogPosts).orderBy(desc(blogPosts.updatedAt)).all();
}

/** Kandidati za duplikate prema nazivu/telefonu/e-mailu/webu/Instagramu. */
export function findDuplicateCandidates(input: {
  name?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  excludeId?: number;
}): { id: number; name: string; slug: string; reason: string }[] {
  const results: { id: number; name: string; slug: string; reason: string }[] = [];
  const seen = new Set<number>();
  const push = (rows: { id: number; name: string; slug: string }[], reason: string) => {
    for (const r of rows) {
      if (r.id === input.excludeId || seen.has(r.id)) continue;
      seen.add(r.id);
      results.push({ ...r, reason });
    }
  };
  if (input.name && input.name.length > 3) {
    push(
      db.all(sql`SELECT id, name, slug FROM listings WHERE name LIKE ${`%${input.name}%`} LIMIT 5`),
      "sličan naziv"
    );
  }
  const norm = (s: string) => s.replace(/[^\d]/g, "");
  if (input.phone && norm(input.phone).length >= 6) {
    push(
      db.all(
        sql`SELECT id, name, slug FROM listings WHERE REPLACE(REPLACE(REPLACE(COALESCE(phone,''),' ',''),'-',''),'/','') LIKE ${`%${norm(input.phone).slice(-8)}%`} LIMIT 5`
      ),
      "isti telefon"
    );
  }
  if (input.email) {
    push(db.all(sql`SELECT id, name, slug FROM listings WHERE email = ${input.email} LIMIT 5`), "isti e-mail");
  }
  if (input.website) {
    const domain = input.website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    if (domain) {
      push(
        db.all(sql`SELECT id, name, slug FROM listings WHERE website LIKE ${`%${domain}%`} LIMIT 5`),
        "ista domena"
      );
    }
  }
  if (input.instagram) {
    const handle = input.instagram.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
    if (handle) {
      push(
        db.all(sql`SELECT id, name, slug FROM listings WHERE instagram LIKE ${`%${handle}%`} LIMIT 5`),
        "isti Instagram"
      );
    }
  }
  return results;
}
