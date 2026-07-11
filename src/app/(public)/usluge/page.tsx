import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/config/site";
import {
  getCategoriesWithCounts,
  getLocationsWithCounts,
  getOccasions,
  getFeaturedListings,
  getPublishedPosts,
} from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CategoryIcon } from "@/components/category-icon";
import { ListingGrid } from "@/components/listing-card";
import { HeroSearch } from "@/components/hero-search";
import { SectionHeading } from "@/components/ui";
import { Faq } from "@/components/faq";
import { pluralOglas } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Event-usluge za proslave i događaje u Hrvatskoj",
  description:
    "Pregledaj sve kategorije event-usluga: napuhanci, animatori, photobooth, catering, prostori, dekoracije i više. Usporedi ponude i pošalji izravan upit.",
  alternates: { canonical: absoluteUrl("/usluge") },
};

export default function UslugePage() {
  const categories = getCategoriesWithCounts();
  const locations = getLocationsWithCounts().filter((l) => l.listingCount > 0);
  const occasions = getOccasions();
  const featured = getFeaturedListings(3);
  const posts = getPublishedPosts(3);
  const categoryIcons = new Map(categories.map((c) => [c.slug, c.icon]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Usluge" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-5xl">
        Event-usluge za proslave i događaje u Hrvatskoj
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Sve što trebaš za proslavu, bez deset otvorenih tabova. Odaberi kategoriju, filtriraj po
        gradu i prigodi te izravno kontaktiraj ponuđače.
      </p>

      <div className="mt-8 max-w-4xl rounded-card bg-plum p-1">
        <HeroSearch locations={locations.map((l) => ({ slug: l.slug, name: l.name }))} compact />
      </div>

      <section className="mt-12">
        <SectionHeading title="Sve kategorije" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              className="rounded-card border border-line bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sand text-plum">
                  <CategoryIcon icon={cat.icon} className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-bold text-plum">
                    <Link href={`/usluge/${cat.slug}`} className="hover:text-coral hover:underline">
                      {cat.name}
                    </Link>
                  </h3>
                  <p className="mt-0.5 text-sm text-muted">
                    {cat.listingCount > 0 ? pluralOglas(cat.listingCount) : "Uskoro"}
                  </p>
                </div>
              </div>
              {cat.children.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {cat.children.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={`/usluge/${sub.slug}`}
                        className="inline-block rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-plum hover:bg-gold/40"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title="Istaknuti ponuđači" />
          <ListingGrid listings={featured} categoryIcons={categoryIcons} />
        </section>
      ) : null}

      <section className="mt-14">
        <SectionHeading title="Popularne lokacije" />
        <div className="flex flex-wrap gap-2">
          {locations.map((loc) => (
            <Link
              key={loc.slug}
              href={`/lokacije/${loc.slug}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-plum hover:border-teal hover:text-teal"
            >
              {loc.name} <span className="font-normal text-muted">({loc.listingCount})</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <SectionHeading title="Popularne prigode" />
        <div className="flex flex-wrap gap-2">
          {occasions.map((occ) => (
            <Link
              key={occ.slug}
              href={`/prigode/${occ.slug}`}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-plum hover:border-coral hover:text-coral"
            >
              {occ.name}
            </Link>
          ))}
        </div>
      </section>

      {posts.length > 0 ? (
        <section className="mt-14">
          <SectionHeading title="Vodiči koji pomažu" />
          <ul className="grid gap-4 md:grid-cols-3">
            {posts.map((p) => (
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
            q: "Kako funkcionira Feštko?",
            a: "Feštko je katalog event-usluga: pretražiš kategoriju i grad, usporediš ponuđače i pošalješ im izravan upit — bez posrednika i bez naknade za korisnike.",
          },
          {
            q: "Naplaćuje li se slanje upita?",
            a: "Ne. Pretraga i kontaktiranje ponuđača potpuno su besplatni za korisnike.",
          },
          {
            q: "Kako mogu dodati svoje poslovanje?",
            a: "Ispuni obrazac na stranici „Dodaj poslovanje”. Osnovni profil je besplatan, a za veću vidljivost dostupan je istaknuti profil.",
          },
        ]}
      />
    </div>
  );
}
