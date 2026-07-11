import { z } from "zod";
import {
  LISTING_STATUSES,
  LISTING_TIERS,
  CLAIM_STATUSES,
  PRICE_MODELS,
} from "@/lib/db/schema";

const trimmed = (max: number, min = 1) => z.string().trim().min(min).max(max);
const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined));

export const leadSchema = z.object({
  listingId: z.coerce.number().int().positive().optional(),
  name: trimmed(120, 2),
  email: z.string().trim().email("Unesi ispravnu e-mail adresu").max(200),
  phone: optionalTrimmed(40),
  eventDate: optionalTrimmed(30),
  eventLocation: optionalTrimmed(120),
  eventType: optionalTrimmed(80),
  message: trimmed(4000, 10),
  consent: z.literal("on", { message: "Potrebna je privola za obradu podataka" }),
  // Honeypot — mora ostati prazan
  website_hp: z.string().max(0).optional().or(z.literal("")),
});

export const claimSchema = z.object({
  listingId: z.coerce.number().int().positive(),
  fullName: trimmed(120, 2),
  email: z.string().trim().email("Unesi ispravnu e-mail adresu").max(200),
  phone: optionalTrimmed(40),
  role: optionalTrimmed(80),
  website: optionalTrimmed(300),
  proofMethod: optionalTrimmed(200),
  message: optionalTrimmed(2000),
  consent: z.literal("on", { message: "Potrebno je prihvatiti uvjete" }),
  website_hp: z.string().max(0).optional().or(z.literal("")),
});

export const businessSubmissionSchema = z.object({
  businessName: trimmed(160, 2),
  contactName: trimmed(120, 2),
  email: z.string().trim().email("Unesi ispravnu e-mail adresu").max(200),
  phone: optionalTrimmed(40),
  website: optionalTrimmed(300),
  instagram: optionalTrimmed(120),
  categorySlug: optionalTrimmed(80),
  locationName: optionalTrimmed(120),
  serviceArea: optionalTrimmed(300),
  description: optionalTrimmed(3000),
  priceFrom: optionalTrimmed(60),
  photosUrl: optionalTrimmed(400),
  note: optionalTrimmed(1000),
  consent: z.literal("on", { message: "Potrebna je privola za obradu podataka" }),
  website_hp: z.string().max(0).optional().or(z.literal("")),
});

const emptyToUndef = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);

export const listingAdminSchema = z.object({
  name: trimmed(160, 2),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug smije sadržavati samo mala slova, brojke i crtice")
    .max(160),
  status: z.enum(LISTING_STATUSES),
  tier: z.enum(LISTING_TIERS),
  claimStatus: z.enum(CLAIM_STATUSES),
  businessName: optionalTrimmed(160),
  shortDescription: z.string().trim().max(300).default(""),
  description: z.string().trim().max(20000).default(""),
  primaryCategoryId: z.preprocess(emptyToUndef, z.coerce.number().int().positive().optional()),
  categoryIds: z.array(z.coerce.number().int().positive()).default([]),
  occasionIds: z.array(z.coerce.number().int().positive()).default([]),
  serviceAreaIds: z.array(z.coerce.number().int().positive()).default([]),
  baseLocationId: z.preprocess(emptyToUndef, z.coerce.number().int().positive().optional()),
  address: optionalTrimmed(300),
  priceFrom: z.preprocess(emptyToUndef, z.coerce.number().nonnegative().optional()),
  priceTo: z.preprocess(emptyToUndef, z.coerce.number().nonnegative().optional()),
  priceModel: z.enum(PRICE_MODELS),
  phone: optionalTrimmed(40),
  whatsapp: optionalTrimmed(40),
  email: optionalTrimmed(200),
  website: optionalTrimmed(300),
  instagram: optionalTrimmed(120),
  facebook: optionalTrimmed(300),
  coverImage: optionalTrimmed(500),
  videoUrl: optionalTrimmed(500),
  servesAtClientLocation: z.coerce.boolean().default(false),
  seoTitle: optionalTrimmed(200),
  seoDescription: optionalTrimmed(400),
  canonicalOverride: optionalTrimmed(400),
  featuredWeight: z.preprocess(emptyToUndef, z.coerce.number().int().min(0).max(100).default(0)),
  featuredFrom: optionalTrimmed(30),
  featuredUntil: optionalTrimmed(30),
  dataSource: optionalTrimmed(300),
  internalNote: optionalTrimmed(2000),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type ClaimInput = z.infer<typeof claimSchema>;
export type BusinessSubmissionInput = z.infer<typeof businessSubmissionSchema>;
export type ListingAdminInput = z.infer<typeof listingAdminSchema>;
