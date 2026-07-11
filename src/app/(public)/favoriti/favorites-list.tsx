"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "@/components/favorites-provider";
import { getListingCards } from "@/lib/actions/public";
import type { ListingCard as ListingCardData } from "@/lib/queries";
import { ListingGrid } from "@/components/listing-card";
import { EmptyState, ButtonLink, ListingCardSkeleton } from "@/components/ui";

export function FavoritesList() {
  const { favorites, ready } = useFavorites();
  const [items, setItems] = useState<ListingCardData[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (favorites.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems([]);
      return;
    }
    let cancelled = false;
    getListingCards(favorites)
      .then((cards) => {
        if (!cancelled) setItems(cards);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, favorites]);

  if (!ready || items === null) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Još nemaš spremljenih oglasa"
        text="Klikni na srce na bilo kojem oglasu i spremi ga za kasnije — favoriti te čekaju ovdje."
      >
        <ButtonLink href="/usluge">Pronađi uslugu</ButtonLink>
      </EmptyState>
    );
  }

  return <ListingGrid listings={items} />;
}
