import type { Metadata } from "next";
import {
  getListings,
  getLocationsWithCounts,
  getOccasions,
  getCategoriesWithCounts,
} from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HeroSearch } from "@/components/hero-search";
import { ListingBrowse, parseBrowseParams, type BrowseSearchParams } from "@/components/listing-browse";

export const metadata: Metadata = {
  title: "Pretraga",
  robots: { index: false, follow: true },
};

interface Props {
  searchParams: Promise<BrowseSearchParams>;
}

export default async function PretragaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { page, ...filters } = parseBrowseParams(sp);
  const [locationsAll, occasions, allCategories, totalRes] = await Promise.all([
    getLocationsWithCounts(),
    getOccasions(),
    getCategoriesWithCounts(),
    getListings({ ...filters, limit: 1 }),
  ]);
  const locations = locationsAll.filter((l) => l.listingCount > 0);
  const categoryIcons = new Map(allCategories.map((c) => [c.slug, c.icon]));
  const total = totalRes.total;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Pretraga" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-4xl">
        {sp.q ? `Rezultati za „${sp.q}”` : "Pretraga usluga"}
      </h1>
      <p className="mt-2 text-muted">{total === 1 ? "1 rezultat" : `${total} rezultata`}</p>
      <div className="mt-6 max-w-4xl rounded-card bg-plum p-1">
        <HeroSearch
          categories={allCategories.map((c) => ({ slug: c.slug, name: c.name, count: c.listingCount }))}
          locations={locations.map((l) => ({ slug: l.slug, name: l.name }))}
          compact
        />
      </div>
      <div className="mt-8">
        <ListingBrowse
          filters={filters}
          page={page}
          basePath="/pretraga"
          searchParams={sp}
          locations={locations.map((l) => ({ slug: l.slug, name: l.name }))}
          occasions={occasions.map((o) => ({ slug: o.slug, name: o.name }))}
          categoryIcons={categoryIcons}
        />
      </div>
    </div>
  );
}
