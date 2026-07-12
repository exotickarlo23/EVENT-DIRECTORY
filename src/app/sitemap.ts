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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const [catsRaw, pairsRaw, occRaw, locRaw, listingRows, postRows] = await Promise.all([
    getCategoriesWithCounts(),
    getIndexableCategoryLocationPairs(),
    getOccasions(),
    getLocationsWithCounts(),
    getAllPublishedListingSlugs(),
    getPublishedPosts(),
  ]);

  // Kategorije s barem jednim oglasom (podkategorije uključene ako imaju sadržaj)
  const categories = catsRaw
    .filter((c) => c.listingCount > 0)
    .flatMap((c) => [
      { url: absoluteUrl(`/usluge/${c.slug}`), lastModified: now, priority: 0.8 },
      ...c.children
        .filter((sub) => sub.listingCount > 0)
        .map((sub) => ({ url: absoluteUrl(`/usluge/${sub.slug}`), lastModified: now, priority: 0.7 })),
    ]);

  // Category × location — samo kombinacije sa stvarnim oglasima
  const pairs = pairsRaw.map((p) => ({
    url: absoluteUrl(`/usluge/${p.categorySlug}/${p.locationSlug}`),
    lastModified: now,
    priority: 0.8,
  }));

  const occTotals = await Promise.all(
    occRaw.map(async (o) => ({ o, total: (await getListings({ occasionSlug: o.slug, limit: 1 })).total }))
  );
  const occasions = occTotals
    .filter((x) => x.total > 0)
    .map((x) => ({ url: absoluteUrl(`/prigode/${x.o.slug}`), lastModified: now, priority: 0.6 }));

  const locations = locRaw
    .filter((l) => l.listingCount > 0)
    .map((l) => ({ url: absoluteUrl(`/lokacije/${l.slug}`), lastModified: now, priority: 0.6 }));

  const listings = listingRows.map((l) => ({
    url: absoluteUrl(listingPath(l)),
    lastModified: new Date(l.updatedAt),
    priority: 0.7,
  }));

  const posts = postRows.map((p) => ({
    url: absoluteUrl(`/vodici/${p.slug}`),
    lastModified: new Date(p.updatedAt),
    priority: 0.6,
  }));

  return [...staticPages, ...categories, ...pairs, ...occasions, ...locations, ...listings, ...posts];
}
