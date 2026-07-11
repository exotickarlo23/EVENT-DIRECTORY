"use client";

import { Heart, Scale } from "lucide-react";
import { useFavorites, COMPARE_LIMIT } from "@/components/favorites-provider";
import { cn } from "@/lib/utils";

export function FavoriteButton({ listingId, className }: { listingId: number; className?: string }) {
  const { favorites, toggleFavorite, ready } = useFavorites();
  const active = ready && favorites.includes(listingId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(listingId);
      }}
      aria-label={active ? "Ukloni iz favorita" : "Spremi u favorite"}
      aria-pressed={active}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-card transition-transform hover:scale-105",
        className
      )}
    >
      <Heart
        className={cn("h-5 w-5", active ? "fill-coral text-coral" : "text-plum")}
        aria-hidden="true"
      />
    </button>
  );
}

export function CompareToggle({ listingId, className }: { listingId: number; className?: string }) {
  const { compare, toggleCompare, ready } = useFavorites();
  const active = ready && compare.includes(listingId);
  const full = ready && !active && compare.length >= COMPARE_LIMIT;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCompare(listingId);
      }}
      disabled={full}
      aria-pressed={active}
      title={full ? `Usporedba prima najviše ${COMPARE_LIMIT} oglasa` : undefined}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
        active ? "border-teal bg-teal text-white" : "border-line bg-white text-plum hover:border-teal",
        full && "opacity-50",
        className
      )}
    >
      <Scale className="h-3.5 w-3.5" aria-hidden="true" />
      {active ? "U usporedbi" : "Usporedi"}
    </button>
  );
}
