import Link from "next/link";
import { MapPin, Star, Check, BadgeCheck, Sparkles } from "lucide-react";
import { absoluteUrl, siteConfig } from "@/config/site";
import { getRelatedListings, getCategoriesWithCounts, type ListingDetail } from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge, ButtonLink, SectionHeading } from "@/components/ui";
import { ListingGallery, ShareButton } from "@/components/gallery";
import { FavoriteButton, CompareToggle } from "@/components/favorite-button";
import { ContactActions, MobileContactBar } from "@/components/contact-actions";
import { LeadForm } from "@/components/lead-form";
import { ListingGrid } from "@/components/listing-card";
import { JsonLd } from "@/components/json-ld";
import { Faq } from "@/components/faq";
import { formatPrice, formatDate, isFeaturedActive } from "@/lib/utils";

/** Cijeli javni prikaz detalja oglasa. Koristi ga kanonski route. */
export async function ListingDetailView({
  listing,
  canonicalPath,
}: {
  listing: ListingDetail;
  canonicalPath: string;
}) {
  const related = await getRelatedListings(listing, 3);
  const categoryIcons = new Map((await getCategoriesWithCounts()).map((c) => [c.slug, c.icon]));
  const featured = isFeaturedActive(listing);
  const unclaimed = listing.claimStatus !== "claimed";

  const defaultMessage = `Pozdrav, zanima me vaša ponuda${
    listing.category ? ` (${listing.category.name.toLowerCase()})` : ""
  }${listing.baseLocation ? ` u gradu ${listing.baseLocation.name}` : ""}. Molim vas informaciju o dostupnosti i cijeni.`;

  const listingFaq = (() => {
    const items: { q: string; a: string }[] = [];
    if (listing.serviceAreaLocations.length > 0) {
      items.push({
        q: "Koje područje pokrivate?",
        a: `Sjedište je u gradu ${listing.baseLocation?.name ?? "—"}, a usluga je dostupna i u: ${listing.serviceAreaLocations.map((l) => l.name).join(", ")}.`,
      });
    }
    if (listing.servesAtClientLocation) {
      items.push({
        q: "Dolazite li na našu adresu?",
        a: "Da, ovaj ponuđač nudi dolazak na adresu događaja. Detalje i eventualne troškove puta dogovori u upitu.",
      });
    }
    return items;
  })();

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Breadcrumbs
          items={[
            { name: "Usluge", href: "/usluge" },
            ...(listing.category
              ? [{ name: listing.category.name, href: `/usluge/${listing.category.slug}` }]
              : []),
            ...(listing.category && listing.baseLocation
              ? [
                  {
                    name: listing.baseLocation.name,
                    href: `/usluge/${listing.category.slug}/${listing.baseLocation.slug}`,
                  },
                ]
              : []),
            { name: listing.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Glavni stupac */}
          <div>
            <ListingGallery
              media={listing.media}
              coverImage={listing.coverImage}
              name={listing.name}
              slug={listing.slug}
              categoryIcon={listing.category?.icon}
            />

            <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {featured ? (
                    <Badge variant="featured">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      Istaknuto
                    </Badge>
                  ) : null}
                  {unclaimed ? <Badge variant="unclaimed">Profil nije preuzet</Badge> : null}
                  {listing.isDemo ? <Badge variant="demo">Demo podaci</Badge> : null}
                </div>
                <h1 className="mt-2 font-display text-3xl font-bold text-plum md:text-4xl">
                  {listing.name}
                </h1>
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                  {listing.category ? (
                    <Link
                      href={`/usluge/${listing.category.slug}`}
                      className="font-bold text-teal hover:underline"
                    >
                      {listing.category.name}
                    </Link>
                  ) : null}
                  {listing.baseLocation ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      {listing.baseLocation.name}
                    </span>
                  ) : null}
                  {listing.reviewCount > 0 && listing.avgRating != null ? (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-4 w-4 fill-gold text-gold" aria-hidden="true" />
                      {listing.avgRating.toLocaleString("hr-HR")} ({listing.reviewCount}{" "}
                      {listing.reviewCount === 1 ? "recenzija" : "recenzije"})
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex gap-2">
                <FavoriteButton listingId={listing.id} className="border border-line" />
                <ShareButton title={listing.name} />
                <CompareToggle listingId={listing.id} />
              </div>
            </div>

            {/* Opis */}
            <section className="mt-8">
              <h2 className="mb-3 font-display text-2xl font-semibold text-plum">O ponudi</h2>
              <p className="whitespace-pre-line leading-relaxed text-ink">{listing.description}</p>
            </section>

            {/* Paketi */}
            {listing.packages.length > 0 ? (
              <section className="mt-10">
                <h2 className="mb-4 font-display text-2xl font-semibold text-plum">Paketi i usluge</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {listing.packages.map((pkg) => (
                    <div key={pkg.id} className="rounded-card border border-line bg-white p-5 shadow-card">
                      <h3 className="font-bold text-plum">{pkg.name}</h3>
                      {pkg.priceFrom != null ? (
                        <p className="mt-1 text-lg font-bold text-coral">
                          {formatPrice(pkg.priceTo != null ? "range" : "from", pkg.priceFrom, pkg.priceTo)}
                        </p>
                      ) : null}
                      {pkg.description ? <p className="mt-2 text-sm text-muted">{pkg.description}</p> : null}
                      {pkg.includes ? (
                        <ul className="mt-3 space-y-1.5">
                          {(JSON.parse(pkg.includes) as string[]).map((inc, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-ink">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                              {inc}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Područje i prigode */}
            <section className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="rounded-card border border-line bg-white p-5 shadow-card">
                <h2 className="font-bold text-plum">Područje pružanja usluge</h2>
                <ul className="mt-3 space-y-1.5 text-sm text-ink">
                  {listing.baseLocation ? (
                    <li className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-coral" aria-hidden="true" />
                      {listing.baseLocation.name} (sjedište)
                    </li>
                  ) : null}
                  {listing.serviceAreaLocations.map((l) => (
                    <li key={l.id} className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-teal" aria-hidden="true" />
                      {l.name}
                    </li>
                  ))}
                  {listing.servesAtClientLocation ? (
                    <li className="flex items-center gap-2 font-semibold text-teal">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Dolazak na adresu događaja
                    </li>
                  ) : null}
                </ul>
              </div>
              {listing.occasionsAll.length > 0 ? (
                <div className="rounded-card border border-line bg-white p-5 shadow-card">
                  <h2 className="font-bold text-plum">Prigode</h2>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {listing.occasionsAll.map((o) => (
                      <Link
                        key={o.slug}
                        href={`/prigode/${o.slug}`}
                        className="rounded-full bg-sand px-3 py-1.5 text-xs font-bold text-plum hover:bg-gold/40"
                      >
                        {o.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            {/* Recenzije */}
            <section className="mt-10">
              <h2 className="mb-4 font-display text-2xl font-semibold text-plum">Recenzije</h2>
              {listing.reviews.length > 0 ? (
                <div className="space-y-4">
                  {listing.reviews.map((r) => (
                    <article key={r.id} className="rounded-card border border-line bg-white p-5 shadow-card">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-plum">{r.authorName}</p>
                        <p className="flex items-center gap-0.5" aria-label={`Ocjena ${r.rating} od 5`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < r.rating ? "fill-gold text-gold" : "text-line"}`}
                              aria-hidden="true"
                            />
                          ))}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-ink">{r.text}</p>
                      <p className="mt-2 text-xs text-muted">{formatDate(r.createdAt)}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="rounded-card border border-line bg-white p-5 text-sm text-muted shadow-card">
                  Ovaj ponuđač još nema recenzija. Bio/la si na događaju s ovom uslugom? Javi nam se
                  preko <Link href="/kontakt" className="font-semibold text-teal underline">kontakt stranice</Link>.
                </p>
              )}
            </section>

            {listingFaq.length > 0 ? <Faq items={listingFaq} title="Pitanja o ovoj usluzi" /> : null}

            {/* Claim blok */}
            {unclaimed ? (
              <section className="mt-10 rounded-card border border-gold/50 bg-gold/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-plum">
                      <BadgeCheck className="h-5 w-5 text-teal" aria-hidden="true" />
                      Je li ovo vaše poslovanje?
                    </h2>
                    <p className="mt-1 max-w-xl text-sm text-muted">
                      Preuzmite profil, ažurirajte podatke i predstavite svoju ponudu potencijalnim
                      klijentima.
                    </p>
                  </div>
                  <ButtonLink href={`/preuzmi-oglas?listing=${listing.slug}`} variant="secondary">
                    Preuzmi ovaj profil
                  </ButtonLink>
                </div>
              </section>
            ) : null}
          </div>

          {/* Desni sticky stupac */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-line bg-white p-6 shadow-card-hover">
              <p className="text-sm font-semibold text-muted">Cijena</p>
              <p className="font-display text-3xl font-bold text-plum">
                {formatPrice(listing.priceModel, listing.priceFrom, listing.priceTo)}
              </p>
              <ContactActions
                listingId={listing.id}
                phone={listing.phone}
                whatsapp={listing.whatsapp}
                email={listing.email}
                website={listing.website}
                instagram={listing.instagram}
                facebook={listing.facebook}
                className="mt-5"
              />
              <div id="kontakt-forma" className="mt-6 border-t border-line pt-5">
                <h2 className="mb-4 font-display text-lg font-semibold text-plum">Pošalji upit</h2>
                <LeadForm
                  listingId={listing.id}
                  listingName={listing.name}
                  defaultMessage={defaultMessage}
                  compact
                />
              </div>
            </div>
          </aside>
        </div>

        {/* Srodni oglasi */}
        {related.length > 0 ? (
          <section className="mt-16 pb-20 lg:pb-0">
            <SectionHeading title="Srodni ponuđači" />
            <ListingGrid listings={related} categoryIcons={categoryIcons} />
          </section>
        ) : null}
      </div>

      <MobileContactBar listingId={listing.id} phone={listing.phone} whatsapp={listing.whatsapp} />

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: listing.name,
          description: listing.shortDescription,
          url: absoluteUrl(canonicalPath),
          ...(listing.phone ? { telephone: listing.phone } : {}),
          ...(listing.baseLocation
            ? {
                address: {
                  "@type": "PostalAddress",
                  addressLocality: listing.baseLocation.name,
                  addressCountry: "HR",
                },
              }
            : {}),
          ...(listing.priceFrom != null
            ? { priceRange: formatPrice(listing.priceModel, listing.priceFrom, listing.priceTo) }
            : {}),
          ...(listing.reviewCount > 0 && listing.avgRating != null
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: listing.avgRating,
                  reviewCount: listing.reviewCount,
                },
              }
            : {}),
          parentOrganization: { "@type": "Organization", name: siteConfig.name },
        }}
      />
    </>
  );
}

/** Kanonske slug segmente (kategorija, lokacija) izvedene iz oglasa. */
export function listingCanonicalSlugs(listing: ListingDetail): {
  categorySlug: string | null;
  locationSlug: string | null;
} {
  return {
    categorySlug: listing.category?.slug ?? listing.categoriesAll[0]?.slug ?? null,
    locationSlug: listing.baseLocation?.slug ?? listing.serviceAreaLocations[0]?.slug ?? null,
  };
}
