import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/config/site";
import {
  getOccasionBySlug,
  getListings,
  getLocationsWithCounts,
  getCategoriesWithCounts,
} from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ListingBrowse, parseBrowseParams, type BrowseSearchParams } from "@/components/listing-browse";
import { SectionHeading } from "@/components/ui";

interface Props {
  params: Promise<{ occasion: string }>;
  searchParams: Promise<BrowseSearchParams>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { occasion } = await params;
  const sp = await searchParams;
  const occ = await getOccasionBySlug(occasion);
  if (!occ) return {};
  const { total } = await getListings({ occasionSlug: occasion, limit: 1 });
  return {
    title: `${occ.name} — usluge i ponuđači`,
    description: `Sve usluge za prigodu ${occ.name.toLowerCase()}: zabava, catering, dekoracije, prostori i oprema. Usporedi ponude i pošalji izravan upit.`,
    alternates: { canonical: absoluteUrl(`/prigode/${occasion}`) },
    robots: total === 0 || Object.keys(sp).length > 0 ? { index: false, follow: true } : undefined,
  };
}

export default async function OccasionPage({ params, searchParams }: Props) {
  const { occasion } = await params;
  const sp = await searchParams;
  const occ = await getOccasionBySlug(occasion);
  if (!occ) notFound();

  const { page, ...filters } = parseBrowseParams(sp);
  const [locationsAll, allCategories] = await Promise.all([
    getLocationsWithCounts(),
    getCategoriesWithCounts(),
  ]);
  const locations = locationsAll.filter((l) => l.listingCount > 0);
  const categoryIcons = new Map(allCategories.map((c) => [c.slug, c.icon]));

  const locWithOfferTotals = await Promise.all(
    locations.map(async (l) => ({
      l,
      total: (await getListings({ occasionSlug: occasion, locationSlug: l.slug, limit: 1 })).total,
    }))
  );
  const locationsWithOffer = locWithOfferTotals.filter((x) => x.total > 0).map((x) => x.l);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Prigode", href: "/prigode" }, { name: occ.name }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-5xl">{occ.name}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Ponuđači s iskustvom u prigodi {occ.name.toLowerCase()} — filtriraj po gradu i cijeni te
        pošalji izravan upit.
      </p>

      <div className="mt-8">
        <ListingBrowse
          filters={{ occasionSlug: occasion, ...filters }}
          page={page}
          basePath={`/prigode/${occasion}`}
          searchParams={sp}
          locations={locations.map((l) => ({ slug: l.slug, name: l.name }))}
          occasions={[]}
          filterConfig={{ showOccasion: false }}
          categoryIcons={categoryIcons}
        />
      </div>

      {locationsWithOffer.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title={`${occ.name} po gradovima`} />
          <div className="flex flex-wrap gap-2">
            {locationsWithOffer.map((l) => (
              <Link
                key={l.slug}
                href={`/prigode/${occasion}/${l.slug}`}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-plum hover:border-teal hover:text-teal"
              >
                {occ.name} {l.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
