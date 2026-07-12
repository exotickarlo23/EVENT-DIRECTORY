import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
} from "drizzle-orm/sqlite-core";

/** Statusi oglasa */
export const LISTING_STATUSES = [
  "draft",
  "pending_review",
  "published",
  "paused",
  "archived",
] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const LISTING_TIERS = ["free", "featured"] as const;
export type ListingTier = (typeof LISTING_TIERS)[number];

export const CLAIM_STATUSES = ["unclaimed", "claim_pending", "claimed"] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export const PRICE_MODELS = ["from", "range", "fixed", "on_request"] as const;
export type PriceModel = (typeof PRICE_MODELS)[number];

export const REQUEST_STATUSES = [
  "pending",
  "under_review",
  "approved",
  "rejected",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const providers = sqliteTable("providers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  note: text("note"),
  createdAt: text("created_at").notNull(),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const occasions = sqliteTable("occasions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const locations = sqliteTable("locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  county: text("county"),
  kind: text("kind").notNull().default("city"), // city | county
  lat: real("lat"),
  lng: real("lng"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const listings = sqliteTable("listings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  status: text("status").$type<ListingStatus>().notNull().default("draft"),
  tier: text("tier").$type<ListingTier>().notNull().default("free"),
  claimStatus: text("claim_status").$type<ClaimStatus>().notNull().default("unclaimed"),
  providerId: integer("provider_id"),
  name: text("name").notNull(),
  businessName: text("business_name"),
  shortDescription: text("short_description").notNull().default(""),
  description: text("description").notNull().default(""),
  primaryCategoryId: integer("primary_category_id"),
  baseLocationId: integer("base_location_id"),
  address: text("address"),
  lat: real("lat"),
  lng: real("lng"),
  priceFrom: real("price_from"),
  priceTo: real("price_to"),
  priceModel: text("price_model").$type<PriceModel>().notNull().default("on_request"),
  currency: text("currency").notNull().default("EUR"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  website: text("website"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  coverImage: text("cover_image"),
  videoUrl: text("video_url"),
  servesAtClientLocation: integer("serves_at_client_location", { mode: "boolean" })
    .notNull()
    .default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  canonicalOverride: text("canonical_override"),
  featuredWeight: integer("featured_weight").notNull().default(0),
  featuredFrom: text("featured_from"),
  featuredUntil: text("featured_until"),
  publishedAt: text("published_at"),
  dataSource: text("data_source"),
  internalNote: text("internal_note"),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const listingCategories = sqliteTable(
  "listing_categories",
  {
    listingId: integer("listing_id").notNull(),
    categoryId: integer("category_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.categoryId] })]
);

export const listingOccasions = sqliteTable(
  "listing_occasions",
  {
    listingId: integer("listing_id").notNull(),
    occasionId: integer("occasion_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.occasionId] })]
);

export const serviceAreas = sqliteTable(
  "service_areas",
  {
    listingId: integer("listing_id").notNull(),
    locationId: integer("location_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.locationId] })]
);

export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: integer("listing_id").notNull(),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  kind: text("kind").notNull().default("image"), // image | video
  sortOrder: integer("sort_order").notNull().default(0),
});

export const packages = sqliteTable("packages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: integer("listing_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  priceFrom: real("price_from"),
  priceTo: real("price_to"),
  includes: text("includes"), // JSON array stringova
  sortOrder: integer("sort_order").notNull().default(0),
});

export const features = sqliteTable("features", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const listingFeatures = sqliteTable(
  "listing_features",
  {
    listingId: integer("listing_id").notNull(),
    featureId: integer("feature_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.featureId] })]
);

export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: integer("listing_id").notNull(),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  authorName: text("author_name").notNull(),
  eventDate: text("event_date"),
  status: text("status").notNull().default("pending"), // pending | approved | rejected | reported
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: integer("listing_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  eventDate: text("event_date"),
  eventLocation: text("event_location"),
  eventType: text("event_type"),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // new | read | archived
  createdAt: text("created_at").notNull(),
});

export const claimRequests = sqliteTable("claim_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  listingId: integer("listing_id").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  role: text("role"),
  website: text("website"),
  proofMethod: text("proof_method"),
  message: text("message"),
  status: text("status").$type<RequestStatus>().notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: text("created_at").notNull(),
});

export const businessSubmissions = sqliteTable("business_submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  instagram: text("instagram"),
  categorySlug: text("category_slug"),
  locationName: text("location_name"),
  serviceArea: text("service_area"),
  description: text("description"),
  priceFrom: text("price_from"),
  photosUrl: text("photos_url"),
  note: text("note"),
  status: text("status").$type<RequestStatus>().notNull().default("pending"),
  createdListingId: integer("created_listing_id"),
  createdAt: text("created_at").notNull(),
});

export const blogCategories = sqliteTable("blog_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const blogPosts = sqliteTable("blog_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""), // Markdown
  coverImage: text("cover_image"),
  categoryId: integer("category_id"),
  author: text("author").notNull().default("slavimo.hr tim"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  faq: text("faq"), // JSON [{q,a}]
  relatedCategorySlugs: text("related_category_slugs"), // JSON [slug]
  status: text("status").notNull().default("draft"), // draft | published
  publishedAt: text("published_at"),
  updatedAt: text("updated_at").notNull(),
});

export const analyticsEvents = sqliteTable("analytics_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  listingId: integer("listing_id"),
  path: text("path"),
  meta: text("meta"),
  createdAt: text("created_at").notNull(),
});

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const pricingPlans = sqliteTable("pricing_plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  price: real("price"),
  currency: text("currency").notNull().default("EUR"),
  period: text("period").notNull().default("mjesečno"),
  description: text("description"),
  featuresJson: text("features_json"), // JSON array stringova
  ctaLabel: text("cta_label").notNull().default("Kontaktiraj nas"),
  highlighted: integer("highlighted", { mode: "boolean" }).notNull().default(false),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Occasion = typeof occasions.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type MediaItem = typeof media.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type ClaimRequest = typeof claimRequests.$inferSelect;
export type BusinessSubmission = typeof businessSubmissions.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type BlogCategory = typeof blogCategories.$inferSelect;
export type PricingPlan = typeof pricingPlans.$inferSelect;
export type Provider = typeof providers.$inferSelect;
