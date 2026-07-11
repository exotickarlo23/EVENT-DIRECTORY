import "server-only";
import { sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  categories,
  occasions,
  locations,
  blogCategories,
  pricingPlans,
  type Category,
  type Occasion,
  type Location,
  type Listing,
  type MediaItem,
  type Package,
  type Review,
  type BlogPost,
  type PriceModel,
  type ListingTier,
  type ClaimStatus,
} from "@/lib/db/schema";
import { asc, eq } from "drizzle-orm";

/** Podaci potrebni za karticu oglasa. */
export interface ListingCard {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  coverImage: string | null;
  priceModel: PriceModel;
  priceFrom: number | null;
  priceTo: number | null;
  tier: ListingTier;
  featuredActive: boolean;
  claimStatus: ClaimStatus;
  servesAtClientLocation: boolean;
  isDemo: boolean;
  categoryName: string | null;
  categorySlug: string | null;
  locationName: string | null;
  locationSlug: string | null;
  avgRating: number | null;
  reviewCount: number;
}

export type ListingSort =
  | "recommended"
  | "featured"
  | "newest"
  | "price_asc"
  | "rating";

export interface ListingFilters {
  categorySlug?: string;
  locationSlug?: string;
  occasionSlug?: string;
  query?: string;
  priceMax?: number;
  featuredOnly?: boolean;
  atClientLocation?: boolean;
  sort?: ListingSort;
  limit?: number;
  offset?: number;
}

interface RawCardRow {
  id: number;
  slug: string;
  name: string;
  short_description: string;
  cover_image: string | null;
  price_model: PriceModel;
  price_from: number | null;
  price_to: number | null;
  tier: ListingTier;
  featured_active: number;
  claim_status: ClaimStatus;
  serves_at_client_location: number;
  is_demo: number;
  category_name: string | null;
  category_slug: string | null;
  location_name: string | null;
  location_slug: string | null;
  avg_rating: number | null;
  review_count: number;
}

function mapCard(r: RawCardRow): ListingCard {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    shortDescription: r.short_description,
    coverImage: r.cover_image,
    priceModel: r.price_model,
    priceFrom: r.price_from,
    priceTo: r.price_to,
    tier: r.tier,
    featuredActive: r.featured_active === 1,
    claimStatus: r.claim_status,
    servesAtClientLocation: r.serves_at_client_location === 1,
    isDemo: r.is_demo === 1,
    categoryName: r.category_name,
    categorySlug: r.category_slug,
    locationName: r.location_name,
    locationSlug: r.location_slug,
    avgRating: r.avg_rating != null ? Math.round(r.avg_rating * 10) / 10 : null,
    reviewCount: r.review_count,
  };
}

const FEATURED_ACTIVE_SQL = sql`(
  l.tier = 'featured'
  AND (l.featured_from IS NULL OR l.featured_from <= datetime('now'))
  AND (l.featured_until IS NULL OR l.featured_until >= datetime('now'))
)`;

function buildWhere(filters: ListingFilters): SQL {
  const conditions: SQL[] = [sql`l.status = 'published'`];

  if (filters.categorySlug) {
    conditions.push(sql`l.id IN (
      SELECT lc.listing_id FROM listing_categories lc
      JOIN categories c ON c.id = lc.category_id
      LEFT JOIN categories p ON p.id = c.parent_id
      WHERE c.slug = ${filters.categorySlug} OR p.slug = ${filters.categorySlug}
    )`);
  }
  if (filters.locationSlug) {
    conditions.push(sql`(
      l.base_location_id IN (SELECT id FROM locations WHERE slug = ${filters.locationSlug})
      OR l.id IN (
        SELECT sa.listing_id FROM service_areas sa
        JOIN locations loc ON loc.id = sa.location_id
        WHERE loc.slug = ${filters.locationSlug}
      )
    )`);
  }
  if (filters.occasionSlug) {
    conditions.push(sql`l.id IN (
      SELECT lo.listing_id FROM listing_occasions lo
      JOIN occasions o ON o.id = lo.occasion_id
      WHERE o.slug = ${filters.occasionSlug}
    )`);
  }
  if (filters.query) {
    const like = `%${filters.query.trim()}%`;
    conditions.push(sql`(
      l.name LIKE ${like}
      OR l.short_description LIKE ${like}
      OR l.description LIKE ${like}
      OR l.business_name LIKE ${like}
      OR l.id IN (
        SELECT lc.listing_id FROM listing_categories lc
        JOIN categories c ON c.id = lc.category_id
        WHERE c.name LIKE ${like}
      )
    )`);
  }
  if (filters.priceMax != null) {
    conditions.push(sql`l.price_from IS NOT NULL AND l.price_from <= ${filters.priceMax}`);
  }
  if (filters.featuredOnly) {
    conditions.push(FEATURED_ACTIVE_SQL);
  }
  if (filters.atClientLocation) {
    conditions.push(sql`l.serves_at_client_location = 1`);
  }
  return sql.join(conditions, sql` AND `);
}

function orderBy(sort: ListingSort): SQL {
  switch (sort) {
    case "newest":
      return sql`featured_active DESC, l.published_at DESC`;
    case "price_asc":
      return sql`l.price_from IS NULL, l.price_from ASC`;
    case "rating":
      return sql`avg_rating IS NULL, avg_rating DESC, review_count DESC`;
    case "featured":
      return sql`featured_active DESC, l.featured_weight DESC, l.published_at DESC`;
    case "recommended":
    default:
      // 1. aktivni istaknuti (po težini), 2. potpunost profila, 3. novije objave
      return sql`featured_active DESC, l.featured_weight DESC, completeness DESC, l.published_at DESC`;
  }
}

const CARD_SELECT = sql`
  SELECT
    l.id, l.slug, l.name, l.short_description, l.cover_image,
    l.price_model, l.price_from, l.price_to, l.tier, l.claim_status,
    l.serves_at_client_location, l.is_demo,
    ${FEATURED_ACTIVE_SQL} AS featured_active,
    (
      (l.cover_image IS NOT NULL)
      + (l.price_from IS NOT NULL)
      + (l.phone IS NOT NULL)
      + (LENGTH(l.description) > 200)
    ) AS completeness,
    c.name AS category_name, c.slug AS category_slug,
    loc.name AS location_name, loc.slug AS location_slug,
    (SELECT AVG(r.rating) FROM reviews r WHERE r.listing_id = l.id AND r.status = 'approved') AS avg_rating,
    (SELECT COUNT(*) FROM reviews r WHERE r.listing_id = l.id AND r.status = 'approved') AS review_count
  FROM listings l
  LEFT JOIN categories c ON c.id = l.primary_category_id
  LEFT JOIN locations loc ON loc.id = l.base_location_id
`;

export function getListings(filters: ListingFilters = {}): {
  items: ListingCard[];
  total: number;
} {
  const where = buildWhere(filters);
  const limit = Math.min(filters.limit ?? 24, 60);
  const offset = filters.offset ?? 0;

  const rows = db.all<RawCardRow>(
    sql`${CARD_SELECT} WHERE ${where} ORDER BY ${orderBy(filters.sort ?? "recommended")} LIMIT ${limit} OFFSET ${offset}`
  );
  const totalRow = db.get<{ total: number }>(
    sql`SELECT COUNT(*) AS total FROM listings l WHERE ${where}`
  );
  return { items: rows.map(mapCard), total: totalRow?.total ?? 0 };
}

export function getFeaturedListings(limit = 8): ListingCard[] {
  return getListings({ featuredOnly: true, sort: "featured", limit }).items;
}

/** Kategorije prve razine s brojem objavljenih oglasa. */
export interface CategoryWithCount extends Category {
  listingCount: number;
  children: Category[];
}

export function getCategoriesWithCounts(): CategoryWithCount[] {
  const all = db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)).all();

  // Broj DISTINCT objavljenih oglasa po pojedinoj (pod)kategoriji.
  const perCategory = db.all<{ category_id: number; cnt: number }>(sql`
    SELECT lc.category_id, COUNT(DISTINCT lc.listing_id) AS cnt
    FROM listing_categories lc
    JOIN listings l ON l.id = lc.listing_id AND l.status = 'published'
    GROUP BY lc.category_id
  `);
  const perCategoryMap = new Map(perCategory.map((c) => [c.category_id, c.cnt]));

  // Za top-level kategoriju broj oglasa je DISTINCT skup oglasa u njoj ILI bilo
  // kojoj njezinoj podkategoriji (isti oglas se ne broji dvaput). Poklapa se s
  // brojem na stranici kategorije (/usluge/[slug]).
  const perTopLevel = db.all<{ top_id: number; cnt: number }>(sql`
    SELECT top.id AS top_id, COUNT(DISTINCT lc.listing_id) AS cnt
    FROM categories top
    JOIN categories c ON c.id = top.id OR c.parent_id = top.id
    JOIN listing_categories lc ON lc.category_id = c.id
    JOIN listings l ON l.id = lc.listing_id AND l.status = 'published'
    WHERE top.parent_id IS NULL
    GROUP BY top.id
  `);
  const topLevelMap = new Map(perTopLevel.map((c) => [c.top_id, c.cnt]));

  const topLevel = all.filter((c) => c.parentId == null);
  return topLevel.map((c) => {
    const children = all
      .filter((ch) => ch.parentId === c.id)
      .map((ch) => ({ ...ch, listingCount: perCategoryMap.get(ch.id) ?? 0 }));
    return { ...c, children, listingCount: topLevelMap.get(c.id) ?? 0 };
  });
}

export function getCategoryBySlug(slug: string): (Category & { parent: Category | null; children: Category[] }) | null {
  const cat = db.select().from(categories).where(eq(categories.slug, slug)).get();
  if (!cat) return null;
  const parent = cat.parentId
    ? db.select().from(categories).where(eq(categories.id, cat.parentId)).get() ?? null
    : null;
  const children = db.select().from(categories).where(eq(categories.parentId, cat.id)).all();
  return { ...cat, parent, children };
}

export function getOccasions(): Occasion[] {
  return db.select().from(occasions).orderBy(asc(occasions.sortOrder), asc(occasions.name)).all();
}

export function getOccasionBySlug(slug: string): Occasion | null {
  return db.select().from(occasions).where(eq(occasions.slug, slug)).get() ?? null;
}

export interface LocationWithCount extends Location {
  listingCount: number;
}

export function getLocationsWithCounts(): LocationWithCount[] {
  const all = db.select().from(locations).orderBy(asc(locations.sortOrder), asc(locations.name)).all();
  const counts = db.all<{ location_id: number; cnt: number }>(sql`
    SELECT loc.id AS location_id, COUNT(DISTINCT l.id) AS cnt
    FROM locations loc
    JOIN listings l ON l.status = 'published' AND (
      l.base_location_id = loc.id
      OR l.id IN (SELECT sa.listing_id FROM service_areas sa WHERE sa.location_id = loc.id)
    )
    GROUP BY loc.id
  `);
  const countMap = new Map(counts.map((c) => [c.location_id, c.cnt]));
  return all.map((l) => ({ ...l, listingCount: countMap.get(l.id) ?? 0 }));
}

export function getLocationBySlug(slug: string): Location | null {
  return db.select().from(locations).where(eq(locations.slug, slug)).get() ?? null;
}

/** Puni detalj oglasa za javnu stranicu. */
export interface ListingDetail extends Listing {
  category: Category | null;
  categoriesAll: Category[];
  baseLocation: Location | null;
  serviceAreaLocations: Location[];
  occasionsAll: Occasion[];
  media: MediaItem[];
  packages: Package[];
  reviews: Review[];
  avgRating: number | null;
  reviewCount: number;
}

export function getListingBySlug(slug: string, { publicOnly = true } = {}): ListingDetail | null {
  const row = db.all<Listing & Record<string, unknown>>(sql`
    SELECT * FROM listings WHERE slug = ${slug} ${publicOnly ? sql`AND status = 'published'` : sql``} LIMIT 1
  `)[0];
  if (!row) return null;
  return hydrateListing(rowToListing(row));
}

function rowToListing(r: Record<string, unknown>): Listing {
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

function hydrateListing(listing: Listing): ListingDetail {
  const category = listing.primaryCategoryId
    ? db.select().from(categories).where(eq(categories.id, listing.primaryCategoryId)).get() ?? null
    : null;
  const categoriesAll = db.all<Category>(sql`
    SELECT c.* FROM categories c JOIN listing_categories lc ON lc.category_id = c.id
    WHERE lc.listing_id = ${listing.id} ORDER BY c.sort_order
  `);
  const baseLocation = listing.baseLocationId
    ? db.select().from(locations).where(eq(locations.id, listing.baseLocationId)).get() ?? null
    : null;
  const serviceAreaLocations = db.all<Location>(sql`
    SELECT loc.* FROM locations loc JOIN service_areas sa ON sa.location_id = loc.id
    WHERE sa.listing_id = ${listing.id} ORDER BY loc.sort_order
  `);
  const occasionsAll = db.all<Occasion>(sql`
    SELECT o.* FROM occasions o JOIN listing_occasions lo ON lo.occasion_id = o.id
    WHERE lo.listing_id = ${listing.id} ORDER BY o.sort_order
  `);
  const mediaItems = db.all<MediaItem>(sql`
    SELECT id, listing_id AS listingId, url, alt, kind, sort_order AS sortOrder
    FROM media WHERE listing_id = ${listing.id} ORDER BY sort_order
  `);
  const pkgs = db.all<Package>(sql`
    SELECT id, listing_id AS listingId, name, description, price_from AS priceFrom,
      price_to AS priceTo, includes, sort_order AS sortOrder
    FROM packages WHERE listing_id = ${listing.id} ORDER BY sort_order
  `);
  const approvedReviews = db.all<Review>(sql`
    SELECT id, listing_id AS listingId, rating, text, author_name AS authorName,
      event_date AS eventDate, status, is_demo AS isDemo, created_at AS createdAt
    FROM reviews WHERE listing_id = ${listing.id} AND status = 'approved'
    ORDER BY created_at DESC
  `);
  const avg =
    approvedReviews.length > 0
      ? Math.round((approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length) * 10) / 10
      : null;
  return {
    ...listing,
    category,
    categoriesAll,
    baseLocation,
    serviceAreaLocations,
    occasionsAll,
    media: mediaItems,
    packages: pkgs,
    reviews: approvedReviews,
    avgRating: avg,
    reviewCount: approvedReviews.length,
  };
}

export function getRelatedListings(listing: ListingDetail, limit = 4): ListingCard[] {
  const rows = db.all<RawCardRow>(sql`
    ${CARD_SELECT}
    WHERE l.status = 'published' AND l.id != ${listing.id}
      AND (
        l.primary_category_id = ${listing.primaryCategoryId ?? -1}
        OR l.base_location_id = ${listing.baseLocationId ?? -1}
        OR l.id IN (
          SELECT lo.listing_id FROM listing_occasions lo
          WHERE lo.occasion_id IN (SELECT occasion_id FROM listing_occasions WHERE listing_id = ${listing.id})
        )
      )
    ORDER BY (l.primary_category_id = ${listing.primaryCategoryId ?? -1}) DESC,
      (l.base_location_id = ${listing.baseLocationId ?? -1}) DESC,
      featured_active DESC, l.published_at DESC
    LIMIT ${limit}
  `);
  return rows.map(mapCard);
}

export function getListingCardsByIds(ids: number[]): ListingCard[] {
  if (ids.length === 0) return [];
  const idList = sql.join(ids.map((id) => sql`${id}`), sql`, `);
  const rows = db.all<RawCardRow>(
    sql`${CARD_SELECT} WHERE l.status = 'published' AND l.id IN (${idList})`
  );
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows.map(mapCard).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

// ---------- Blog ----------

export function getPublishedPosts(limit?: number): (BlogPost & { categoryName: string | null })[] {
  const rows = db.all<Record<string, unknown>>(sql`
    SELECT bp.*, bc.name AS category_name
    FROM blog_posts bp LEFT JOIN blog_categories bc ON bc.id = bp.category_id
    WHERE bp.status = 'published'
    ORDER BY bp.published_at DESC
    ${limit ? sql`LIMIT ${limit}` : sql``}
  `);
  return rows.map((r) => ({ ...mapPost(r), categoryName: (r.category_name as string) ?? null }));
}

function mapPost(r: Record<string, unknown>): BlogPost {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    coverImage: r.cover_image,
    categoryId: r.category_id,
    author: r.author,
    seoTitle: r.seo_title,
    seoDescription: r.seo_description,
    faq: r.faq,
    relatedCategorySlugs: r.related_category_slugs,
    status: r.status,
    publishedAt: r.published_at,
    updatedAt: r.updated_at,
  } as BlogPost;
}

export function getPostBySlug(slug: string): (BlogPost & { categoryName: string | null }) | null {
  const r = db.all<Record<string, unknown>>(sql`
    SELECT bp.*, bc.name AS category_name
    FROM blog_posts bp LEFT JOIN blog_categories bc ON bc.id = bp.category_id
    WHERE bp.slug = ${slug} AND bp.status = 'published' LIMIT 1
  `)[0];
  if (!r) return null;
  return { ...mapPost(r), categoryName: (r.category_name as string) ?? null };
}

export function getBlogCategories() {
  return db.select().from(blogCategories).orderBy(asc(blogCategories.sortOrder)).all();
}

export function getActivePricingPlans() {
  return db
    .select()
    .from(pricingPlans)
    .where(eq(pricingPlans.active, true))
    .orderBy(asc(pricingPlans.sortOrder))
    .all();
}

/** Kombinacije kategorija × lokacija koje imaju barem jedan oglas (za sitemap + SEO). */
export function getIndexableCategoryLocationPairs(): {
  categorySlug: string;
  locationSlug: string;
  count: number;
}[] {
  return db.all<{ categorySlug: string; locationSlug: string; count: number }>(sql`
    SELECT c.slug AS categorySlug, loc.slug AS locationSlug, COUNT(DISTINCT l.id) AS count
    FROM listings l
    JOIN listing_categories lc ON lc.listing_id = l.id
    JOIN categories c ON c.id = lc.category_id AND c.parent_id IS NULL
    JOIN locations loc ON (
      loc.id = l.base_location_id
      OR loc.id IN (SELECT sa.location_id FROM service_areas sa WHERE sa.listing_id = l.id)
    )
    WHERE l.status = 'published'
    GROUP BY c.slug, loc.slug
    HAVING count >= 1
  `);
}

export function getAllPublishedListingSlugs(): { slug: string; updatedAt: string }[] {
  return db.all<{ slug: string; updatedAt: string }>(
    sql`SELECT slug, updated_at AS updatedAt FROM listings WHERE status = 'published'`
  );
}
