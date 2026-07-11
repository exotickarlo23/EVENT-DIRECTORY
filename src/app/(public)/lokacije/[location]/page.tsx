import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/config/site";
import {
  getLocationBySlug,
  getListings,
  getOccasions,
  getCategoriesWithCounts,
} from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ListingBrowse, parseBrowseParams, type BrowseSearchParams } from "@/components/listing-browse";
import { SectionHeading } from "@/components/ui";

interface Props {
  params: Promise<{ location: string }>;
  searchParams: Promise<BrowseSearchParams>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { location } = await params;
  const sp = await searchParams;
  const loc = getLocationBySlug(location);
  if (!loc) return {};
  const { total } = getListings({ locationSlug: location, limit: 1 });
  return {
    title: `Event-usluge ${loc.name} — ponuda i cijene`,
    description: `Sve event-usluge dostupne u gradu ${loc.name}: zabava, catering, prostori, dekoracije i oprema. Usporedi ponude i pošalji izravan upit.`,
    alternates: { canonical: absoluteUrl(`/lokacije/${location}`) },
    robots: total === 0 || Object.keys(sp).length > 0 ? { index: false, follow: true } : undefined,
  };
}

export default async function LocationPage({ params, searchParams }: Props) {
  const { location } = await params;
  const sp = await searchParams;
  const loc = getLocationBySlug(location);
  if (!loc) notFound();

  const { page, ...filters } = parseBrowseParams(sp);
  const occasions = getOccasions();
  const allCategories = getCategoriesWithCounts();
  const categoryIcons = new Map(allCategories.map((c) => [c.slug, c.icon]));
  const categoriesHere = allCategories.filter(
    (c) => getListings({ categorySlug: c.slug, locationSlug: location, limit: 1 }).total > 0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Lokacije", href: "/lokacije" }, { name: loc.name }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-5xl">
        Event-usluge — {loc.name}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Ponuđači sa sjedištem u gradu {loc.name} i oni koji dolaze na tvoju adresu
        {loc.county ? ` (${loc.county})` : ""}.
      </p>

      <div className="mt-8">
        <ListingBrowse
          filters={{ locationSlug: location, ...filters }}
          page={page}
          basePath={`/lokacije/${location}`}
          searchParams={sp}
          locations={[]}
          occasions={occasions.map((o) => ({ slug: o.slug, name: o.name }))}
          filterConfig={{ showLocation: false }}
          categoryIcons={categoryIcons}
        />
      </div>

      {categoriesHere.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title={`Usluge po kategorijama — ${loc.name}`} />
          <div className="flex flex-wrap gap-2">
            {categoriesHere.map((c) => (
              <Link
                key={c.slug}
                href={`/usluge/${c.slug}/${location}`}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-plum hover:border-coral hover:text-coral"
              >
                {c.name} {loc.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
