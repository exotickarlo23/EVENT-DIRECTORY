"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, TriangleAlert } from "lucide-react";
import { useFavorites } from "@/components/favorites-provider";
import { getListingCards } from "@/lib/actions/public";
import type { ListingCard as ListingCardData } from "@/lib/queries";
import { EmptyState, ButtonLink, Skeleton, Badge } from "@/components/ui";
import { formatPrice } from "@/lib/utils";

export function CompareTable() {
  const { compare, toggleCompare, clearCompare, ready } = useFavorites();
  const [items, setItems] = useState<ListingCardData[] | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (compare.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems([]);
      return;
    }
    let cancelled = false;
    getListingCards(compare)
      .then((cards) => {
        if (!cancelled) setItems(cards);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, compare]);

  if (!ready || items === null) {
    return <Skeleton className="h-72 w-full" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Usporedba je prazna"
        text="Dodaj oglase u usporedbu klikom na „Usporedi” na stranici oglasa."
      >
        <ButtonLink href="/usluge">Pronađi uslugu</ButtonLink>
      </EmptyState>
    );
  }

  const mixedCategories = new Set(items.map((i) => i.categorySlug)).size > 1;

  return (
    <div>
      {mixedCategories ? (
        <p className="mb-4 flex items-start gap-2 rounded-xl bg-gold/20 px-4 py-3 text-sm font-semibold text-plum">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Uspoređuješ oglase iz različitih kategorija — neke usporedbe možda nisu smislene.
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-card border border-line bg-white shadow-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="w-36 p-4 text-left font-bold text-muted">
                Oglas
              </th>
              {items.map((item) => (
                <th scope="col" key={item.id} className="min-w-44 p-4 text-left align-top">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/ponudaci/${item.slug}`}
                      className="font-display text-base font-semibold text-plum hover:text-coral"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleCompare(item.id)}
                      aria-label={`Ukloni ${item.name} iz usporedbe`}
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-sand"
                    >
                      <X className="h-4 w-4 text-muted" aria-hidden="true" />
                    </button>
                  </div>
                  {item.featuredActive ? <Badge variant="featured">Istaknuto</Badge> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <CompareRow label="Kategorija" values={items.map((i) => i.categoryName ?? "—")} />
            <CompareRow label="Lokacija" values={items.map((i) => i.locationName ?? "—")} />
            <CompareRow
              label="Cijena"
              values={items.map((i) => formatPrice(i.priceModel, i.priceFrom, i.priceTo))}
            />
            <CompareRow
              label="Dolazak na adresu"
              values={items.map((i) => (i.servesAtClientLocation ? "Da" : "—"))}
            />
            <CompareRow
              label="Ocjena"
              values={items.map((i) =>
                i.reviewCount > 0 && i.avgRating != null
                  ? `${i.avgRating.toLocaleString("hr-HR")} (${i.reviewCount})`
                  : "Bez recenzija"
              )}
            />
            <tr>
              <th scope="row" className="p-4 text-left font-bold text-muted">
                &nbsp;
              </th>
              {items.map((item) => (
                <td key={item.id} className="p-4">
                  <ButtonLink href={`/ponudaci/${item.slug}`} size="sm">
                    Pogledaj ponudu
                  </ButtonLink>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={clearCompare}
        className="mt-4 text-sm font-semibold text-muted underline-offset-4 hover:text-plum hover:underline"
      >
        Isprazni usporedbu
      </button>
    </div>
  );
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="border-t border-line">
      <th scope="row" className="p-4 text-left font-bold text-muted">
        {label}
      </th>
      {values.map((v, i) => (
        <td key={i} className="p-4 text-ink">
          {v}
        </td>
      ))}
    </tr>
  );
}
