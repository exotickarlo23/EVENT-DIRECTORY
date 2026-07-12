import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { listingPath } from "@/lib/utils";
import {
  getCategoriesWithCounts,
  getOccasions,
  getLocationsWithCounts,
  getPublishedPosts,
  getAllPublishedListingSlugs,
  getIndexableCategoryLocationPairs,
  getListings,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = [
    "/",
    "/usluge",
    "/prigode",
    "/lokacije",
    "/vodici",
    "/postani-partner",
    "/cjenik",
    "/dodaj-poslovanje",
    "/kako-funkcionira",
    "/o-nama",
    "/kontakt",
    "/pravila-koristenja",
    "/politika-privatnosti",
    "/kolacici",
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    priority: path === "/" ? 1 : 0.6,
  }));

  // Kategorije s barem jednim oglasom (podkategorije uključene ako imaju sadržaj)
  const categories = getCategoriesWithCounts()
    .filter((c) => c.listingCount > 0)
    .flatMap((c) => [
      { url: absoluteUrl(`/usluge/${c.slug}`), lastModified: now, priority: 0.8 },
      ...c.children
        .filter((sub) => getListings({ categorySlug: sub.slug, limit: 1 }).total > 0)
        .map((sub) => ({ url: absoluteUrl(`/usluge/${sub.slug}`), lastModified: now, priority: 0.7 })),
    ]);

  // Category × location — samo kombinacije sa stvarnim oglasima
  const pairs = getIndexableCategoryLocationPairs().map((p) => ({
    url: absoluteUrl(`/usluge/${p.categorySlug}/${p.locationSlug}`),
    lastModified: now,
    priority: 0.8,
  }));

  const occasions = getOccasions()
    .filter((o) => getListings({ occasionSlug: o.slug, limit: 1 }).total > 0)
    .map((o) => ({ url: absoluteUrl(`/prigode/${o.slug}`), lastModified: now, priority: 0.6 }));

  const locations = getLocationsWithCounts()
    .filter((l) => l.listingCount > 0)
    .map((l) => ({ url: absoluteUrl(`/lokacije/${l.slug}`), lastModified: now, priority: 0.6 }));

  const listings = getAllPublishedListingSlugs().map((l) => ({
    url: absoluteUrl(listingPath(l)),
    lastModified: new Date(l.updatedAt),
    priority: 0.7,
  }));

  const posts = getPublishedPosts().map((p) => ({
    url: absoluteUrl(`/vodici/${p.slug}`),
    lastModified: new Date(p.updatedAt),
    priority: 0.6,
  }));

  return [...staticPages, ...categories, ...pairs, ...occasions, ...locations, ...listings, ...posts];
}
