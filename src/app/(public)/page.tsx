import Link from "next/link";
import type { Metadata } from "next";
import {
  MapPin,
  Search,
  MessagesSquare,
  Layers,
  Tag,
  ArrowRight,
} from "lucide-react";
import { siteConfig, absoluteUrl } from "@/config/site";
import {
  getCategoriesWithCounts,
  getFeaturedListings,
  getLocationsWithCounts,
  getPublishedPosts,
} from "@/lib/queries";
import { HeroSearch } from "@/components/hero-search";
import { ListingGrid } from "@/components/listing-card";
import { GuideCard } from "@/components/guide-card";
import { CategoryIcon } from "@/components/category-icon";
import { SectionHeading, ButtonLink } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { pluralOglas } from "@/lib/utils";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: absoluteUrl("/") },
};

export default function HomePage() {
  const categories = getCategoriesWithCounts();
  const featured = getFeaturedListings(8);
  const locations = getLocationsWithCounts().filter((l) => l.listingCount > 0);
  const posts = getPublishedPosts(3);
  const categoryIcons = new Map(categories.map((c) => [c.slug, c.icon]));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
          email: siteConfig.contact.email,
          sameAs: [siteConfig.social.instagram, siteConfig.social.facebook].filter(Boolean),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteConfig.url,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${siteConfig.url}/pretraga?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* Hero */}
      <section className="relative -mt-16 overflow-hidden bg-plum pb-16 pt-28 md:pb-24 md:pt-36">
        <HeroDecor />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-gold">
              Tvoj događaj počinje ovdje
            </p>
            <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-6xl">
              Sve za događaj koji se pamti.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80 md:text-xl">
              Pronađi prostore, zabavu, catering, dekoracije, fotografe i opremu za svoju
              proslavu — na jednom mjestu.
            </p>
          </div>
          <div className="mt-8 max-w-4xl">
            <HeroSearch locations={locations.map((l) => ({ slug: l.slug, name: l.name }))} />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section aria-label="Zašto Feštko" className="border-b border-line bg-sand/60">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-4">
          <TrustItem icon={<Layers className="h-5 w-5" />} text="Sve usluge na jednom mjestu" />
          <TrustItem icon={<MapPin className="h-5 w-5" />} text="Pretraga po lokaciji" />
          <TrustItem icon={<MessagesSquare className="h-5 w-5" />} text="Izravan kontakt s ponuđačima" />
          <TrustItem icon={<Tag className="h-5 w-5" />} text="Jasne cijene gdje su dostupne" />
        </div>
      </section>

      {/* Kategorije */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading
          title="Što trebaš za svoju proslavu?"
          subtitle="Od prvog plana do zadnje pjesme — pronađi prave ljude i usluge za svaki dio događaja."
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 12).map((cat) => (
            <Link
              key={cat.slug}
              href={`/usluge/${cat.slug}`}
              className="group rounded-card border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-1 hover:border-coral/40 hover:shadow-card-hover"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sand text-plum transition-colors group-hover:bg-coral group-hover:text-white">
                <CategoryIcon icon={cat.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-3 font-bold leading-snug text-plum">{cat.name}</h3>
              {cat.listingCount > 0 ? (
                <p className="mt-1 text-sm text-muted">{pluralOglas(cat.listingCount)}</p>
              ) : null}
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <ButtonLink href="/usluge" variant="outline">
            Sve kategorije
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </section>

      {/* Istaknuti oglasi */}
      {featured.length > 0 ? (
        <section className="bg-sand/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              title="Ponude koje vrijedi pogledati"
              subtitle="Istaknuti ponuđači spremni su tvoju ideju pretvoriti u pravi događaj."
            />
            <ListingGrid listings={featured.slice(0, 6)} categoryIcons={categoryIcons} />
          </div>
        </section>
      ) : null}

      {/* Kako funkcionira */}
      <section className="bg-teal/[0.06] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading title="Od ideje do upita u tri jednostavna koraka" align="center" />
          <div className="grid gap-6 md:grid-cols-3">
            <StepCard
              step={1}
              icon={<Search className="h-6 w-6" />}
              title="Reci nam što tražiš"
              text="Odaberi uslugu, prigodu i lokaciju."
            />
            <StepCard
              step={2}
              icon={<Layers className="h-6 w-6" />}
              title="Usporedi ponuđače"
              text="Pregledaj fotografije, cijene, područje rada i iskustva drugih korisnika."
            />
            <StepCard
              step={3}
              icon={<MessagesSquare className="h-6 w-6" />}
              title="Pošalji izravan upit"
              text="Kontaktiraj odabrane ponuđače bez nepotrebnih posrednika."
            />
          </div>
        </div>
      </section>

      {/* Lokacije */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading title="Pronađi usluge u svom gradu" />
        <div className="flex flex-wrap gap-3">
          {locations.map((loc) => (
            <Link
              key={loc.slug}
              href={`/lokacije/${loc.slug}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 font-semibold text-plum shadow-card transition-colors hover:border-teal hover:text-teal"
            >
              <MapPin className="h-4 w-4 text-coral" aria-hidden="true" />
              {loc.name}
              <span className="text-sm font-normal text-muted">{pluralOglas(loc.listingCount)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Vodiči */}
      {posts.length > 0 ? (
        <section className="bg-sand/50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              title="Lakše organiziraj svoj događaj"
              subtitle="Praktični vodiči, ideje i stvarne informacije o cijenama, rezervacijama i organizaciji."
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <GuideCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA za ponuđače */}
      <section className="relative overflow-hidden bg-plum py-16 md:py-20">
        <HeroDecor />
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-gold">
            Pružaš event-usluge?
          </p>
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold text-white md:text-5xl">
            Neka te pronađu ljudi koji upravo planiraju događaj.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Predstavi svoje poslovanje, pokaži ponudu i primaj ciljane upite iz svog grada i
            kategorije.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/dodaj-poslovanje" size="lg">
              Dodaj svoje poslovanje
            </ButtonLink>
            <Link
              href="/cjenik"
              className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-white/40 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Pogledaj pakete
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <p className="flex items-center gap-3 text-sm font-semibold text-plum">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-teal shadow-card">
        {icon}
      </span>
      {text}
    </p>
  );
}

function StepCard({
  step,
  icon,
  title,
  text,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="relative rounded-card border border-line bg-white p-6 shadow-card">
      <span className="absolute -top-4 left-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-coral font-display text-sm font-bold text-white">
        {step}
      </span>
      <span className="mt-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
        {icon}
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold text-plum">{title}</h3>
      <p className="mt-2 text-sm text-muted">{text}</p>
    </div>
  );
}

/** Diskretne dekorativne konfete za tamne sekcije. */
function HeroDecor() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
      aria-hidden="true"
    >
      <defs>
        <pattern id="hero-confetti" width="140" height="140" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="26" r="3" fill="#F3C85B" />
          <rect x="80" y="50" width="8" height="8" rx="2" fill="#F45F5A" transform="rotate(24 84 54)" />
          <circle cx="120" cy="110" r="2.5" fill="#25756F" />
          <path d="M40 100l4 8h-8z" fill="#F3C85B" />
          <rect x="110" y="14" width="6" height="6" rx="1.5" fill="#FFF9F2" transform="rotate(-16 113 17)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hero-confetti)" />
    </svg>
  );
}
