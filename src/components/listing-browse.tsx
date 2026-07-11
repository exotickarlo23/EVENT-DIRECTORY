import Link from "next/link";
import { getListings, type ListingFilters as Filters, type ListingSort } from "@/lib/queries";
import { ListingGrid } from "@/components/listing-card";
import { ListingFilters, type FilterConfig } from "@/components/listing-filters";
import { EmptyState, ButtonLink } from "@/components/ui";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/config/site";
import { pluralOglas, cn } from "@/lib/utils";
import type { NavTaxonomyItem } from "@/components/header";

const PAGE_SIZE = 12;

export interface BrowseSearchParams {
  lokacija?: string;
  prigoda?: string;
  cijena?: string;
  dolazak?: string;
  istaknuto?: string;
  sort?: string;
  stranica?: string;
  q?: string;
}

export function parseBrowseParams(sp: BrowseSearchParams): Partial<Filters> & { page: number } {
  const page = Math.max(1, Number(sp.stranica) || 1);
  const sorts: ListingSort[] = ["recommended", "featured", "newest", "price_asc", "rating"];
  return {
    locationSlug: sp.lokacija || undefined,
    occasionSlug: sp.prigoda || undefined,
    priceMax: sp.cijena ? Number(sp.cijena) || undefined : undefined,
    atClientLocation: sp.dolazak === "1" || undefined,
    featuredOnly: sp.istaknuto === "1" || undefined,
    query: sp.q || undefined,
    sort: sorts.includes(sp.sort as ListingSort) ? (sp.sort as ListingSort) : "recommended",
    page,
  };
}

/** Grid rezultata s filterima, brojem rezultata, paginacijom i ItemList schemom. */
export function ListingBrowse({
  filters,
  page,
  basePath,
  searchParams,
  locations,
  occasions,
  filterConfig,
  emptyState,
  categoryIcons,
}: {
  filters: Filters;
  page: number;
  basePath: string;
  searchParams: BrowseSearchParams;
  locations: NavTaxonomyItem[];
  occasions: NavTaxonomyItem[];
  filterConfig?: FilterConfig;
  emptyState?: React.ReactNode;
  categoryIcons?: Map<string, string | null>;
}) {
  const { items, total } = getListings({
    ...filters,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <ListingFilters locations={locations} occasions={occasions} config={filterConfig} />
      <p className="mb-5 text-sm font-semibold text-muted" role="status">
        {total === 0 ? "Nema rezultata" : `Pronađeno: ${pluralOglas(total)}`}
      </p>
      {items.length > 0 ? (
        <>
          <ListingGrid listings={items} categoryIcons={categoryIcons} />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "ItemList",
              numberOfItems: total,
              itemListElement: items.map((l, i) => ({
                "@type": "ListItem",
                position: (page - 1) * PAGE_SIZE + i + 1,
                url: absoluteUrl(`/ponudaci/${l.slug}`),
                name: l.name,
              })),
            }}
          />
          {totalPages > 1 ? (
            <Pagination basePath={basePath} searchParams={searchParams} page={page} totalPages={totalPages} />
          ) : null}
        </>
      ) : (
        emptyState ?? (
          <EmptyState
            title="Još nemamo ponuđače za ovu kombinaciju"
            text="Pogledaj ponude iz obližnjih gradova ili nam reci što tražiš pa ćemo ti pomoći pronaći opcije."
          >
            <ButtonLink href="/lokacije" variant="outline">
              Pogledaj obližnje lokacije
            </ButtonLink>
            <ButtonLink href="/kontakt">Pošalji upit</ButtonLink>
          </EmptyState>
        )
      )}
    </div>
  );
}

function pageHref(basePath: string, sp: BrowseSearchParams, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (value && key !== "stranica") params.set(key, value);
  }
  if (page > 1) params.set("stranica", String(page));
  const qs = params.toString();
  return `${basePath}${qs ? `?${qs}` : ""}`;
}

function Pagination({
  basePath,
  searchParams,
  page,
  totalPages,
}: {
  basePath: string;
  searchParams: BrowseSearchParams;
  page: number;
  totalPages: number;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );
  return (
    <nav aria-label="Stranice rezultata" className="mt-10 flex justify-center gap-2">
      {page > 1 ? (
        <PageLink href={pageHref(basePath, searchParams, page - 1)}>← Prethodna</PageLink>
      ) : null}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && pages[i - 1] !== p - 1 ? <span className="text-muted">…</span> : null}
          <PageLink href={pageHref(basePath, searchParams, p)} current={p === page}>
            {p}
          </PageLink>
        </span>
      ))}
      {page < totalPages ? (
        <PageLink href={pageHref(basePath, searchParams, page + 1)}>Sljedeća →</PageLink>
      ) : null}
    </nav>
  );
}

function PageLink({
  href,
  current = false,
  children,
}: {
  href: string;
  current?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-4 py-2 text-sm font-bold",
        current ? "bg-plum text-white" : "border border-line bg-white text-plum hover:border-plum/40"
      )}
    >
      {children}
    </Link>
  );
}
