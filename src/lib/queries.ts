import "server-only";
import { sql, type SQL, asc, eq, and } from "drizzle-orm";
import { db, dbAll, dbGet } from "@/lib/db/client";
import {
  categories,
  occasions,
  locations,
  blogCategories,
  pricingPlans,
  listings,
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

export type ListingSort = "recommended" | "featured" | "newest" | "price_asc" | "rating";

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
  AND (l.featured_from IS NULL OR l.featured_from::timestamptz <= now())
  AND (l.featured_until IS NULL OR l.featured_until::timestamptz >= now())
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
      l.name ILIKE ${like}
      OR l.short_description ILIKE ${like}
      OR l.description ILIKE ${like}
      OR l.business_name ILIKE ${like}
      OR l.id IN (
        SELECT lc.listing_id FROM listing_categories lc
        JOIN categories c ON c.id = lc.category_id
        WHERE c.name ILIKE ${like}
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
    conditions.push(sql`l.serves_at_client_location = true`);
  }
  return sql.join(conditions, sql` AND `);
}

function orderBy(sort: ListingSort): SQL {
  switch (sort) {
    case "newest":
      return sql`featured_active DESC, l.published_at DESC`;
    case "price_asc":
      return sql`(l.price_from IS NULL), l.price_from ASC`;
    case "rating":
      return sql`(avg_rating IS NULL), avg_rating DESC, review_count DESC`;
    case "featured":
      return sql`featured_active DESC, l.featured_weight DESC, l.published_at DESC`;
    case "recommended":
    default:
      return sql`featured_active DESC, l.featured_weight DESC, completeness DESC, l.published_at DESC`;
  }
}

const CARD_SELECT = sql`
  SELECT
    l.id, l.slug, l.name, l.short_description, l.cover_image,
    l.price_model, l.price_from, l.price_to, l.tier, l.claim_status,
    l.serves_at_client_location::int AS serves_at_client_location,
    l.is_demo::int AS is_demo,
    (${FEATURED_ACTIVE_SQL})::int AS featured_active,
    (
      (l.cover_image IS NOT NULL)::int
      + (l.price_from IS NOT NULL)::int
      + (l.phone IS NOT NULL)::int
      + (length(l.description) > 200)::int
    ) AS completeness,
    c.name AS category_name, c.slug AS category_slug,
    loc.name AS location_name, loc.slug AS location_slug,
    (SELECT AVG(r.rating)::float FROM reviews r WHERE r.listing_id = l.id AND r.status = 'approved') AS avg_rating,
    (SELECT COUNT(*)::int FROM reviews r WHERE r.listing_id = l.id AND r.status = 'approved') AS review_count
  FROM listings l
  LEFT JOIN categories c ON c.id = l.primary_category_id
  LEFT JOIN locations loc ON loc.id = l.base_location_id
`;

export async function getListings(filters: ListingFilters = {}): Promise<{
  items: ListingCard[];
  total: number;
}> {
  const where = buildWhere(filters);
  const limit = Math.min(filters.limit ?? 24, 60);
  const offset = filters.offset ?? 0;

  const rows = await dbAll<RawCardRow>(
    sql`${CARD_SELECT} WHERE ${where} ORDER BY ${orderBy(filters.sort ?? "recommended")} LIMIT ${limit} OFFSET ${offset}`
  );
  const totalRow = await dbGet<{ total: number }>(
    sql`SELECT COUNT(*)::int AS total FROM listings l WHERE ${where}`
  );
  return { items: rows.map(mapCard), total: totalRow?.total ?? 0 };
}

export async function getFeaturedListings(limit = 8): Promise<ListingCard[]> {
  return (await getListings({ featuredOnly: true, sort: "featured", limit })).items;
}

/** Kategorije prve razine s brojem objavljenih oglasa. */
export interface CategoryWithCount extends Category {
  listingCount: number;
  children: (Category & { listingCount: number })[];
}

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const all = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  const perCategory = await dbAll<{ category_id: number; cnt: number }>(sql`
    SELECT lc.category_id, COUNT(DISTINCT lc.listing_id)::int AS cnt
    FROM listing_categories lc
    JOIN listings l ON l.id = lc.listing_id AND l.status = 'published'
    GROUP BY lc.category_id
  `);
  const perCategoryMap = new Map(perCategory.map((c) => [c.category_id, c.cnt]));

  const perTopLevel = await dbAll<{ top_id: number; cnt: number }>(sql`
    SELECT top.id AS top_id, COUNT(DISTINCT lc.listing_id)::int AS cnt
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

export async function getCategoryBySlug(
  slug: string
): Promise<(Category & { parent: Category | null; children: Category[] }) | null> {
  const cat = (await db.select().from(categories).where(eq(categories.slug, slug)).limit(1))[0];
  if (!cat) return null;
  const parent = cat.parentId
    ? (await db.select().from(categories).where(eq(categories.id, cat.parentId)).limit(1))[0] ?? null
    : null;
  const children = await db.select().from(categories).where(eq(categories.parentId, cat.id));
  return { ...cat, parent, children };
}

export async function getOccasions(): Promise<Occasion[]> {
  return db.select().from(occasions).orderBy(asc(occasions.sortOrder), asc(occasions.name));
}

export async function getOccasionBySlug(slug: string): Promise<Occasion | null> {
  return (await db.select().from(occasions).where(eq(occasions.slug, slug)).limit(1))[0] ?? null;
}

export interface LocationWithCount extends Location {
  listingCount: number;
}

export async function getLocationsWithCounts(): Promise<LocationWithCount[]> {
  const all = await db
    .select()
    .from(locations)
    .orderBy(asc(locations.sortOrder), asc(locations.name));
  const counts = await dbAll<{ location_id: number; cnt: number }>(sql`
    SELECT loc.id AS location_id, COUNT(DISTINCT l.id)::int AS cnt
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

export async function getLocationBySlug(slug: string): Promise<Location | null> {
  return (await db.select().from(locations).where(eq(locations.slug, slug)).limit(1))[0] ?? null;
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

export async function getListingBySlug(
  slug: string,
  { publicOnly = true } = {}
): Promise<ListingDetail | null> {
  const where = publicOnly
    ? and(eq(listings.slug, slug), eq(listings.status, "published"))
    : eq(listings.slug, slug);
  const row = (await db.select().from(listings).where(where).limit(1))[0];
  if (!row) return null;
  return hydrateListing(row);
}

async function hydrateListing(listing: Listing): Promise<ListingDetail> {
  const category = listing.primaryCategoryId
    ? (await db.select().from(categories).where(eq(categories.id, listing.primaryCategoryId)).limit(1))[0] ?? null
    : null;
  const categoriesAll = await dbAll<Category>(sql`
    SELECT c.* FROM categories c JOIN listing_categories lc ON lc.category_id = c.id
    WHERE lc.listing_id = ${listing.id} ORDER BY c.sort_order
  `);
  const baseLocation = listing.baseLocationId
    ? (await db.select().from(locations).where(eq(locations.id, listing.baseLocationId)).limit(1))[0] ?? null
    : null;
  const serviceAreaLocations = await dbAll<Location>(sql`
    SELECT loc.* FROM locations loc JOIN service_areas sa ON sa.location_id = loc.id
    WHERE sa.listing_id = ${listing.id} ORDER BY loc.sort_order
  `);
  const occasionsAll = await dbAll<Occasion>(sql`
    SELECT o.* FROM occasions o JOIN listing_occasions lo ON lo.occasion_id = o.id
    WHERE lo.listing_id = ${listing.id} ORDER BY o.sort_order
  `);
  const mediaItems = await dbAll<MediaItem>(sql`
    SELECT id, listing_id AS "listingId", url, alt, kind, sort_order AS "sortOrder"
    FROM media WHERE listing_id = ${listing.id} ORDER BY sort_order
  `);
  const pkgs = await dbAll<Package>(sql`
    SELECT id, listing_id AS "listingId", name, description, price_from AS "priceFrom",
      price_to AS "priceTo", includes, sort_order AS "sortOrder"
    FROM packages WHERE listing_id = ${listing.id} ORDER BY sort_order
  `);
  const approvedReviews = await dbAll<Review>(sql`
    SELECT id, listing_id AS "listingId", rating, text, author_name AS "authorName",
      event_date AS "eventDate", status, is_demo AS "isDemo", created_at AS "createdAt"
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

export async function getRelatedListings(listing: ListingDetail, limit = 4): Promise<ListingCard[]> {
  const rows = await dbAll<RawCardRow>(sql`
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

export async function getListingCardsByIds(ids: number[]): Promise<ListingCard[]> {
  if (ids.length === 0) return [];
  const idList = sql.join(
    ids.map((id) => sql`${id}`),
    sql`, `
  );
  const rows = await dbAll<RawCardRow>(
    sql`${CARD_SELECT} WHERE l.status = 'published' AND l.id IN (${idList})`
  );
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows.map(mapCard).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}

// ---------- Blog ----------

export async function getPublishedPosts(
  limit?: number
): Promise<(BlogPost & { categoryName: string | null })[]> {
  const rows = await dbAll<Record<string, unknown>>(sql`
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

export async function getPostBySlug(
  slug: string
): Promise<(BlogPost & { categoryName: string | null }) | null> {
  const r = (
    await dbAll<Record<string, unknown>>(sql`
      SELECT bp.*, bc.name AS category_name
      FROM blog_posts bp LEFT JOIN blog_categories bc ON bc.id = bp.category_id
      WHERE bp.slug = ${slug} AND bp.status = 'published' LIMIT 1
    `)
  )[0];
  if (!r) return null;
  return { ...mapPost(r), categoryName: (r.category_name as string) ?? null };
}

export async function getBlogCategories() {
  return db.select().from(blogCategories).orderBy(asc(blogCategories.sortOrder));
}

export async function getActivePricingPlans() {
  return db
    .select()
    .from(pricingPlans)
    .where(eq(pricingPlans.active, true))
    .orderBy(asc(pricingPlans.sortOrder));
}

/** Kombinacije kategorija × lokacija koje imaju barem jedan oglas (za sitemap + SEO). */
export async function getIndexableCategoryLocationPairs(): Promise<
  { categorySlug: string; locationSlug: string; count: number }[]
> {
  return dbAll<{ categorySlug: string; locationSlug: string; count: number }>(sql`
    SELECT c.slug AS "categorySlug", loc.slug AS "locationSlug", COUNT(DISTINCT l.id)::int AS count
    FROM listings l
    JOIN listing_categories lc ON lc.listing_id = l.id
    JOIN categories c ON c.id = lc.category_id AND c.parent_id IS NULL
    JOIN locations loc ON (
      loc.id = l.base_location_id
      OR loc.id IN (SELECT sa.location_id FROM service_areas sa WHERE sa.listing_id = l.id)
    )
    WHERE l.status = 'published'
    GROUP BY c.slug, loc.slug
    HAVING COUNT(DISTINCT l.id) >= 1
  `);
}

export async function getAllPublishedListingSlugs(): Promise<
  { slug: string; updatedAt: string; categorySlug: string | null; locationSlug: string | null }[]
> {
  return dbAll<{
    slug: string;
    updatedAt: string;
    categorySlug: string | null;
    locationSlug: string | null;
  }>(sql`
    SELECT l.slug, l.updated_at AS "updatedAt",
      c.slug AS "categorySlug",
      loc.slug AS "locationSlug"
    FROM listings l
    LEFT JOIN categories c ON c.id = l.primary_category_id
    LEFT JOIN locations loc ON loc.id = l.base_location_id
    WHERE l.status = 'published'
  `);
}
