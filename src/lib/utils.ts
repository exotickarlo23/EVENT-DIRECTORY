import type { PriceModel } from "@/lib/db/schema";

/** Spaja class-name stringove, preskače falsy vrijednosti. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const eurFormatter = new Intl.NumberFormat("hr-HR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatEur(value: number): string {
  return eurFormatter.format(value);
}

/** „Od 150 €”, „150–300 €” ili „Cijena na upit” */
export function formatPrice(
  priceModel: PriceModel,
  priceFrom: number | null,
  priceTo: number | null
): string {
  if (priceModel === "on_request" || priceFrom == null) return "Cijena na upit";
  if (priceModel === "fixed") return formatEur(priceFrom);
  if (priceModel === "range" && priceTo != null)
    return `${eurFormatter.format(priceFrom).replace(/\s*€/, "")}–${eurFormatter.format(priceTo)}`;
  return `Od ${formatEur(priceFrom)}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("hr-HR", { dateStyle: "long" }).format(d);
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Pretvara hrvatski tekst u čisti URL slug (č→c, š→s, đ→d …). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/č|ć/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Kanonski URL pojedinačnog oglasa: /usluge/[kategorija]/[lokacija]/[ime].
 * Kategorija i lokacija se izvode iz podataka oglasa; kad nedostaju, koriste se
 * stabilni fallback segmenti (oglas se i dalje jednoznačno identificira slugom).
 */
export function listingPath(input: {
  slug: string;
  categorySlug?: string | null;
  locationSlug?: string | null;
}): string {
  const category = input.categorySlug || "ostalo";
  const location = input.locationSlug || "hrvatska";
  return `/usluge/${category}/${location}/${input.slug}`;
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Je li oglas trenutno u aktivnom istaknutom razdoblju? */
export function isFeaturedActive(listing: {
  tier: string;
  featuredFrom: string | null;
  featuredUntil: string | null;
}): boolean {
  if (listing.tier !== "featured") return false;
  const now = Date.now();
  if (listing.featuredFrom && new Date(listing.featuredFrom).getTime() > now) return false;
  if (listing.featuredUntil && new Date(listing.featuredUntil).getTime() < now) return false;
  return true;
}

export function pluralOglas(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} oglas`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} oglasa`;
  return `${n} oglasa`;
}

export function normalizeWhatsapp(phone: string): string {
  return phone.replace(/[^\d+]/g, "").replace(/^\+/, "").replace(/^0/, "385");
}
