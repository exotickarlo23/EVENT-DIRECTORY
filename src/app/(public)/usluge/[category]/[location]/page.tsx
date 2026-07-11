import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/config/site";
import {
  getCategoryBySlug,
  getLocationBySlug,
  getListings,
  getLocationsWithCounts,
  getOccasions,
  getCategoriesWithCounts,
  getPublishedPosts,
} from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ListingBrowse, parseBrowseParams, type BrowseSearchParams } from "@/components/listing-browse";
import { Faq } from "@/components/faq";
import { SectionHeading, EmptyState, ButtonLink } from "@/components/ui";
import { formatEur } from "@/lib/utils";

interface Props {
  params: Promise<{ category: string; location: string }>;
  searchParams: Promise<BrowseSearchParams>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category, location } = await params;
  const sp = await searchParams;
  const cat = getCategoryBySlug(category);
  const loc = getLocationBySlug(location);
  if (!cat || !loc) return {};
  const { total } = getListings({ categorySlug: category, locationSlug: location, limit: 1 });
  const hasFilters = Object.keys(sp).length > 0;
  return {
    title: `${cat.name} ${loc.name} — ponuda i cijene`,
    description: `Pronađi ponuđače za ${cat.name.toLowerCase()} u gradu ${loc.name}. Usporedi ponudu, fotografije, cijene i područje dostave te izravno pošalji upit.`,
    alternates: { canonical: absoluteUrl(`/usluge/${category}/${location}`) },
    // Prazne ili filtrirane kombinacije ne indeksiramo — bez SEO spama
    robots: total === 0 || hasFilters ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryLocationPage({ params, searchParams }: Props) {
  const { category, location } = await params;
  const sp = await searchParams;
  const cat = getCategoryBySlug(category);
  const loc = getLocationBySlug(location);
  if (!cat || !loc) notFound();

  const { page, ...filters } = parseBrowseParams(sp);
  const occasions = getOccasions();
  const allLocations = getLocationsWithCounts().filter((l) => l.listingCount > 0);
  const allCategories = getCategoriesWithCounts();
  const categoryIcons = new Map(allCategories.map((c) => [c.slug, c.icon]));

  const { items: allInCombo, total } = getListings({
    categorySlug: category,
    locationSlug: location,
    limit: 60,
  });
  const cheapest = allInCombo
    .map((l) => l.priceFrom)
    .filter((p): p is number => p != null)
    .sort((a, b) => a - b)[0];

  // Obližnje lokacije s ponudom u ovoj kategoriji (za empty state i interne linkove)
  const nearbyWithOffer = allLocations
    .filter((l) => l.slug !== location)
    .filter((l) => getListings({ categorySlug: category, locationSlug: l.slug, limit: 1 }).total > 0)
    .slice(0, 8);

  const relatedCategories = allCategories
    .filter((c) => c.slug !== category)
    .filter((c) => getListings({ categorySlug: c.slug, locationSlug: location, limit: 1 }).total > 0)
    .slice(0, 6);

  const posts = getPublishedPosts().filter((p) => {
    try {
      return (JSON.parse(p.relatedCategorySlugs ?? "[]") as string[]).includes(category);
    } catch {
      return false;
    }
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { name: "Usluge", href: "/usluge" },
          { name: cat.name, href: `/usluge/${category}` },
          { name: loc.name },
        ]}
      />
      <h1 className="font-display text-3xl font-bold text-plum md:text-5xl">
        {cat.name} — {loc.name}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        {total > 0 ? (
          <>
            {total === 1 ? "Jedan ponuđač" : `${total} ponuđača`} za{" "}
            {cat.name.toLowerCase()} dostupno u gradu {loc.name}
            {loc.county ? ` (${loc.county})` : ""}
            {cheapest != null ? `, s cijenama već od ${formatEur(cheapest)}` : ""}. Usporedi
            ponude i pošalji izravan upit.
          </>
        ) : (
          <>Trenutno tražimo ponuđače za {cat.name.toLowerCase()} u gradu {loc.name}.</>
        )}
      </p>

      <div className="mt-8">
        <ListingBrowse
          filters={{ categorySlug: category, locationSlug: location, ...filters }}
          page={page}
          basePath={`/usluge/${category}/${location}`}
          searchParams={sp}
          locations={[]}
          occasions={occasions.map((o) => ({ slug: o.slug, name: o.name }))}
          filterConfig={{ showLocation: false }}
          categoryIcons={categoryIcons}
          emptyState={
            <EmptyState
              title="Još nemamo ponuđače za ovu kombinaciju"
              text={`Pogledaj ponude iz obližnjih gradova ili nam reci što tražiš pa ćemo ti pomoći pronaći opcije za ${cat.name.toLowerCase()} u gradu ${loc.name}.`}
            >
              {nearbyWithOffer.slice(0, 3).map((l) => (
                <ButtonLink key={l.slug} href={`/usluge/${category}/${l.slug}`} variant="outline">
                  {cat.name} {l.name}
                </ButtonLink>
              ))}
              <ButtonLink href="/kontakt">Pošalji upit</ButtonLink>
            </EmptyState>
          }
        />
      </div>

      {nearbyWithOffer.length > 0 && total > 0 ? (
        <section className="mt-14">
          <SectionHeading title="Povezani gradovi" />
          <div className="flex flex-wrap gap-2">
            {nearbyWithOffer.map((l) => (
              <Link
                key={l.slug}
                href={`/usluge/${category}/${l.slug}`}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-plum hover:border-teal hover:text-teal"
              >
                {cat.name} {l.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {relatedCategories.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title={`Ostale usluge — ${loc.name}`} />
          <div className="flex flex-wrap gap-2">
            {relatedCategories.map((c) => (
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

      {posts.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title="Vodiči za odabir" />
          <ul className="grid gap-4 md:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <li key={p.slug} className="rounded-card border border-line bg-white p-5 shadow-card">
                <Link href={`/vodici/${p.slug}`} className="font-bold text-plum hover:text-coral">
                  {p.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {total > 0 ? (
        <Faq
          items={[
            {
              q: `Koliko košta ${cat.name.toLowerCase()} u gradu ${loc.name}?`,
              a:
                cheapest != null
                  ? `Cijene na Feštku u ovoj kombinaciji kreću od ${formatEur(cheapest)}, a konačan iznos ovisi o terminu, trajanju i opsegu usluge. Točnu ponudu zatraži izravnim upitom.`
                  : "Većina ponuđača u ovoj kategoriji daje cijenu na upit jer ovisi o terminu, trajanju i opsegu usluge. Pošalji upit s opisom događaja za točnu ponudu.",
            },
            {
              q: `Dolaze li ponuđači na moju adresu u gradu ${loc.name}?`,
              a: "Dio ponuđača nudi dolazak na adresu — označeno je na kartici oglasa i u detaljima profila, a možeš filtrirati po opciji „Dolazak na adresu”.",
            },
            {
              q: "Kako rezervirati termin?",
              a: "Pošalji upit s datumom i lokacijom događaja izravno preko profila ponuđača. Ponuđač ti odgovara s dostupnošću i ponudom — rezervacija se dogovara izravno s njim.",
            },
          ]}
        />
      ) : null}
    </div>
  );
}
