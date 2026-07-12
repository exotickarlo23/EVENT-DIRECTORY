import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";

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

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const providers = pgTable("providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  note: text("note"),
  createdAt: text("created_at").notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  parentId: integer("parent_id"),
  description: text("description"),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const occasions = pgTable("occasions", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  county: text("county"),
  kind: text("kind").notNull().default("city"), // city | county
  lat: real("lat"),
  lng: real("lng"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
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
  servesAtClientLocation: boolean("serves_at_client_location").notNull().default(false),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  canonicalOverride: text("canonical_override"),
  featuredWeight: integer("featured_weight").notNull().default(0),
  featuredFrom: text("featured_from"),
  featuredUntil: text("featured_until"),
  publishedAt: text("published_at"),
  dataSource: text("data_source"),
  internalNote: text("internal_note"),
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const listingCategories = pgTable(
  "listing_categories",
  {
    listingId: integer("listing_id").notNull(),
    categoryId: integer("category_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.categoryId] })]
);

export const listingOccasions = pgTable(
  "listing_occasions",
  {
    listingId: integer("listing_id").notNull(),
    occasionId: integer("occasion_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.occasionId] })]
);

export const serviceAreas = pgTable(
  "service_areas",
  {
    listingId: integer("listing_id").notNull(),
    locationId: integer("location_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.locationId] })]
);

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  kind: text("kind").notNull().default("image"), // image | video
  sortOrder: integer("sort_order").notNull().default(0),
});

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  priceFrom: real("price_from"),
  priceTo: real("price_to"),
  includes: text("includes"), // JSON array stringova
  sortOrder: integer("sort_order").notNull().default(0),
});

export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
});

export const listingFeatures = pgTable(
  "listing_features",
  {
    listingId: integer("listing_id").notNull(),
    featureId: integer("feature_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.listingId, t.featureId] })]
);

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  authorName: text("author_name").notNull(),
  eventDate: text("event_date"),
  status: text("status").notNull().default("pending"), // pending | approved | rejected | reported
  isDemo: boolean("is_demo").notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
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

export const claimRequests = pgTable("claim_requests", {
  id: serial("id").primaryKey(),
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

export const businessSubmissions = pgTable("business_submissions", {
  id: serial("id").primaryKey(),
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

export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
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

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  listingId: integer("listing_id"),
  path: text("path"),
  meta: text("meta"),
  createdAt: text("created_at").notNull(),
});

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const pricingPlans = pgTable("pricing_plans", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  price: real("price"),
  currency: text("currency").notNull().default("EUR"),
  period: text("period").notNull().default("mjesečno"),
  description: text("description"),
  featuresJson: text("features_json"), // JSON array stringova
  ctaLabel: text("cta_label").notNull().default("Kontaktiraj nas"),
  highlighted: boolean("highlighted").notNull().default(false),
  active: boolean("active").notNull().default(true),
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
