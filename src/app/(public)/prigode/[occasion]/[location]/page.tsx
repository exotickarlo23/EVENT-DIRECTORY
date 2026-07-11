import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/config/site";
import {
  getOccasionBySlug,
  getLocationBySlug,
  getListings,
  getCategoriesWithCounts,
} from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ListingBrowse, parseBrowseParams, type BrowseSearchParams } from "@/components/listing-browse";

interface Props {
  params: Promise<{ occasion: string; location: string }>;
  searchParams: Promise<BrowseSearchParams>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { occasion, location } = await params;
  const sp = await searchParams;
  const occ = getOccasionBySlug(occasion);
  const loc = getLocationBySlug(location);
  if (!occ || !loc) return {};
  const { total } = getListings({ occasionSlug: occasion, locationSlug: location, limit: 1 });
  return {
    title: `${occ.name} ${loc.name} — usluge i ponuđači`,
    description: `Usluge za prigodu ${occ.name.toLowerCase()} u gradu ${loc.name}: usporedi ponuđače i pošalji izravan upit preko Feštka.`,
    alternates: { canonical: absoluteUrl(`/prigode/${occasion}/${location}`) },
    robots: total === 0 || Object.keys(sp).length > 0 ? { index: false, follow: true } : undefined,
  };
}

export default async function OccasionLocationPage({ params, searchParams }: Props) {
  const { occasion, location } = await params;
  const sp = await searchParams;
  const occ = getOccasionBySlug(occasion);
  const loc = getLocationBySlug(location);
  if (!occ || !loc) notFound();

  const { page, ...filters } = parseBrowseParams(sp);
  const allCategories = getCategoriesWithCounts();
  const categoryIcons = new Map(allCategories.map((c) => [c.slug, c.icon]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { name: "Prigode", href: "/prigode" },
          { name: occ.name, href: `/prigode/${occasion}` },
          { name: loc.name },
        ]}
      />
      <h1 className="font-display text-3xl font-bold text-plum md:text-5xl">
        {occ.name} — {loc.name}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Ponuđači dostupni u gradu {loc.name} s iskustvom u prigodi {occ.name.toLowerCase()}.
      </p>
      <div className="mt-8">
        <ListingBrowse
          filters={{ occasionSlug: occasion, locationSlug: location, ...filters }}
          page={page}
          basePath={`/prigode/${occasion}/${location}`}
          searchParams={sp}
          locations={[]}
          occasions={[]}
          filterConfig={{ showLocation: false, showOccasion: false }}
          categoryIcons={categoryIcons}
        />
      </div>
    </div>
  );
}
