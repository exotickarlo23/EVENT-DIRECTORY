/**
 * Centralna konfiguracija brenda i stranice.
 * Promjena imena, taglinea, kontakata ili društvenih mreža radi se SAMO ovdje.
 */
export const siteConfig = {
  name: "slavimo.hr",
  tagline: "Sve za događaj koji se pamti.",
  description:
    "slavimo.hr je katalog i tražilica event-usluga u Hrvatskoj. Pronađi prostore, zabavu, catering, dekoracije, fotografe i opremu za svoju proslavu — na jednom mjestu.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "hr-HR",
  currency: "EUR",
  contact: {
    email: "info@slavimo.hr",
    phone: "+385 91 000 0000",
  },
  social: {
    instagram: "https://instagram.com/slavimo.hr",
    facebook: "https://facebook.com/slavimo.hr",
    tiktok: "",
  },
  legal: {
    companyName: "slavimo.hr",
    address: "Zagreb, Hrvatska",
  },
} as const;

export function absoluteUrl(path: string): string {
  return `${siteConfig.url.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
