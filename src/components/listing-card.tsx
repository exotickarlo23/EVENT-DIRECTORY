import Link from "next/link";
import { MapPin, Star, ArrowRight, Sparkles } from "lucide-react";
import type { ListingCard as ListingCardData } from "@/lib/queries";
import { formatPrice, cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { ListingImage } from "@/components/listing-image";
import { FavoriteButton } from "@/components/favorite-button";

export function ListingCard({
  listing,
  categoryIcon,
  priority = false,
}: {
  listing: ListingCardData;
  categoryIcon?: string | null;
  priority?: boolean;
}) {
  const featured = listing.featuredActive;
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover",
        featured ? "border-gold/70 bg-gold/[0.04]" : "border-line"
      )}
    >
      <div className="relative">
        <ListingImage
          src={listing.coverImage}
          alt={`${listing.name} — ${listing.categoryName ?? "event usluga"}`}
          seed={listing.slug}
          categoryIcon={categoryIcon}
          className="transition-transform duration-300 group-hover:scale-[1.02]"
          priority={priority}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {featured ? (
            <Badge variant="featured">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Istaknuto
            </Badge>
          ) : null}
          {listing.isDemo ? <Badge variant="demo">Demo</Badge> : null}
        </div>
        <FavoriteButton listingId={listing.id} className="absolute right-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-teal">
          {listing.categoryName ?? "Event usluga"}
        </p>
        <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-plum">
          {/* Cijela kartica klikabilna preko ::after, uz ispravan fokus na linku */}
          <Link
            href={`/ponudaci/${listing.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {listing.name}
          </Link>
        </h3>
        {listing.locationName ? (
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {listing.locationName}
            {listing.servesAtClientLocation ? " · dolazak na adresu" : ""}
          </p>
        ) : null}
        <p className="mt-2 line-clamp-2 text-sm text-muted">{listing.shortDescription}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-sm font-bold text-plum">
              {formatPrice(listing.priceModel, listing.priceFrom, listing.priceTo)}
            </p>
            {listing.reviewCount > 0 && listing.avgRating != null ? (
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" aria-hidden="true" />
                {listing.avgRating.toLocaleString("hr-HR")} ({listing.reviewCount})
              </p>
            ) : null}
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm font-bold transition-colors",
              featured ? "text-coral-dark" : "text-coral group-hover:text-coral-dark"
            )}
            aria-hidden="true"
          >
            Pogledaj ponudu
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

export function ListingGrid({
  listings,
  categoryIcons,
  priorityCount = 0,
}: {
  listings: ListingCardData[];
  categoryIcons?: Map<string, string | null>;
  priorityCount?: number;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((l, i) => (
        <ListingCard
          key={l.id}
          listing={l}
          categoryIcon={categoryIcons?.get(l.categorySlug ?? "")}
          priority={i < priorityCount}
        />
      ))}
    </div>
  );
}
