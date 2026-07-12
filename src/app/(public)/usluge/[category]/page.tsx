import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl } from "@/config/site";
import {
  getCategoryBySlug,
  getListings,
  getLocationsWithCounts,
  getOccasions,
  getPublishedPosts,
  getCategoriesWithCounts,
} from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ListingBrowse, parseBrowseParams, type BrowseSearchParams } from "@/components/listing-browse";
import { Faq } from "@/components/faq";
import { SectionHeading, ButtonLink } from "@/components/ui";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<BrowseSearchParams>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category } = await params;
  const sp = await searchParams;
  const cat = getCategoryBySlug(category);
  if (!cat) return {};
  const { total } = getListings({ categorySlug: category, limit: 1 });
  const hasFilters = Object.keys(sp).length > 0;
  return {
    title: `${cat.name} — ponuda i cijene u Hrvatskoj`,
    description: `Pronađi ponuđače u kategoriji ${cat.name.toLowerCase()}. Usporedi ponudu, fotografije i cijene te izravno pošalji upit preko Feštka.`,
    alternates: { canonical: absoluteUrl(`/usluge/${category}`) },
    robots: total === 0 || hasFilters ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const sp = await searchParams;
  const cat = getCategoryBySlug(category);
  if (!cat) notFound();

  const { page, ...filters } = parseBrowseParams(sp);
  const locations = getLocationsWithCounts().filter((l) => l.listingCount > 0);
  const occasions = getOccasions();
  const allCategories = getCategoriesWithCounts();
  const categoryIcons = new Map(allCategories.map((c) => [c.slug, c.icon]));
  const posts = getPublishedPosts().filter((p) => {
    try {
      const related = JSON.parse(p.relatedCategorySlugs ?? "[]") as string[];
      return related.includes(category) || related.includes(cat.parent?.slug ?? "");
    } catch {
      return false;
    }
  });

  // Lokacije s oglasima u ovoj kategoriji (za interne linkove na category×location stranice)
  const locationsInCategory = locations.filter(
    (loc) => getListings({ categorySlug: category, locationSlug: loc.slug, limit: 1 }).total > 0
  );
  const related = allCategories.filter((c) => c.slug !== category && c.slug !== cat.parent?.slug).slice(0, 6);

  const crumbs = cat.parent
    ? [
        { name: "Usluge", href: "/usluge" },
        { name: cat.parent.name, href: `/usluge/${cat.parent.slug}` },
        { name: cat.name },
      ]
    : [{ name: "Usluge", href: "/usluge" }, { name: cat.name }];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-5xl">{cat.name}</h1>
      {cat.description ? <p className="mt-3 max-w-2xl text-lg text-muted">{cat.description}</p> : null}

      {cat.children.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {cat.children.map((sub) => (
            <Link
              key={sub.slug}
              href={`/usluge/${sub.slug}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-plum hover:border-coral hover:text-coral"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="mt-8">
        <ListingBrowse
          filters={{ categorySlug: category, ...filters }}
          page={page}
          basePath={`/usluge/${category}`}
          searchParams={sp}
          locations={locations.map((l) => ({ slug: l.slug, name: l.name }))}
          occasions={occasions.map((o) => ({ slug: o.slug, name: o.name }))}
          categoryIcons={categoryIcons}
        />
      </div>

      {locationsInCategory.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title={`${cat.name} po gradovima`} />
          <div className="flex flex-wrap gap-2">
            {locationsInCategory.map((loc) => (
              <Link
                key={loc.slug}
                href={`/usluge/${category}/${loc.slug}`}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-plum hover:border-teal hover:text-teal"
              >
                {cat.name} {loc.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title="Povezane kategorije" />
          <div className="flex flex-wrap gap-2">
            {related.map((c) => (
              <Link
                key={c.slug}
                href={`/usluge/${c.slug}`}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-plum hover:border-coral hover:text-coral"
              >
                {c.name}
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

      <Faq
        items={[
          {
            q: `Kako odabrati ponuđača u kategoriji ${cat.name.toLowerCase()}?`,
            a: "Usporedi nekoliko ponuda: pogledaj fotografije, cijene i područje rada, pa pošalji upit dvojici-trojici ponuđača s istim opisom događaja kako bi ponude bile usporedive.",
          },
          {
            q: "Koliko unaprijed poslati upit?",
            a: "Za termine vikendom preporučujemo javiti se barem 3–4 tjedna ranije; za vjenčanja i veće evente i nekoliko mjeseci.",
          },
          {
            q: "Je li slanje upita besplatno?",
            a: "Da — slavimo.hr je besplatan za korisnike. Upit šalješ izravno ponuđaču, bez posrednika.",
          },
        ]}
      />

      <section className="mt-14 rounded-card bg-plum p-8 text-center md:p-10">
        <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
          Pružaš usluge u ovoj kategoriji?
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-white/80">
          Dodaj svoje poslovanje i primaj upite od ljudi koji upravo traže {cat.name.toLowerCase()}.
        </p>
        <div className="mt-6">
          <ButtonLink href="/dodaj-poslovanje" size="lg">
            Dodaj svoje poslovanje
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
