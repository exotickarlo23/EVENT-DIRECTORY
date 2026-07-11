"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Label, Select, Button, Input } from "@/components/ui";
import type { NavTaxonomyItem } from "@/components/header";

export interface FilterConfig {
  showLocation?: boolean;
  showOccasion?: boolean;
}

/**
 * Toolbar filtera — GET navigacija (SEO-friendly), na mobitelu u draweru.
 * Prikazuju se samo filteri koji imaju dostupne podatke.
 */
export function ListingFilters({
  locations,
  occasions,
  config = {},
}: {
  locations: NavTaxonomyItem[];
  occasions: NavTaxonomyItem[];
  config?: FilterConfig;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const current = {
    lokacija: searchParams.get("lokacija") ?? "",
    prigoda: searchParams.get("prigoda") ?? "",
    cijena: searchParams.get("cijena") ?? "",
    dolazak: searchParams.get("dolazak") ?? "",
    istaknuto: searchParams.get("istaknuto") ?? "",
    sort: searchParams.get("sort") ?? "",
  };
  const activeCount = [current.lokacija, current.prigoda, current.cijena, current.dolazak, current.istaknuto].filter(Boolean).length;

  function apply(formData: FormData) {
    const params = new URLSearchParams();
    for (const key of ["lokacija", "prigoda", "cijena", "dolazak", "istaknuto"]) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    if (current.sort) params.set("sort", current.sort);
    setDrawerOpen(false);
    router.push(`${pathname}${params.size > 0 ? `?${params}` : ""}`, { scroll: false });
  }

  function setSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (sort) params.set("sort", sort);
    else params.delete("sort");
    params.delete("stranica");
    router.push(`${pathname}${params.size > 0 ? `?${params}` : ""}`, { scroll: false });
  }

  const filterFields = (
    <>
      {config.showLocation !== false && locations.length > 0 ? (
        <div>
          <Label htmlFor="f-lokacija">Lokacija</Label>
          <Select id="f-lokacija" name="lokacija" defaultValue={current.lokacija}>
            <option value="">Sve lokacije</option>
            {locations.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
      {config.showOccasion !== false && occasions.length > 0 ? (
        <div>
          <Label htmlFor="f-prigoda">Prigoda</Label>
          <Select id="f-prigoda" name="prigoda" defaultValue={current.prigoda}>
            <option value="">Sve prigode</option>
            {occasions.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name}
              </option>
            ))}
          </Select>
        </div>
      ) : null}
      <div>
        <Label htmlFor="f-cijena">Cijena do (€)</Label>
        <Input
          id="f-cijena"
          name="cijena"
          type="number"
          min={0}
          step={10}
          placeholder="npr. 300"
          defaultValue={current.cijena}
        />
      </div>
      <div className="flex flex-col justify-end gap-2">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-plum">
          <input
            type="checkbox"
            name="dolazak"
            value="1"
            defaultChecked={current.dolazak === "1"}
            className="h-4 w-4 accent-coral"
          />
          Dolazak na adresu
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-plum">
          <input
            type="checkbox"
            name="istaknuto"
            value="1"
            defaultChecked={current.istaknuto === "1"}
            className="h-4 w-4 accent-coral"
          />
          Samo istaknuti
        </label>
      </div>
    </>
  );

  return (
    <div className="mb-6">
      {/* Desktop toolbar */}
      <form
        action={apply}
        className="hidden items-end gap-3 rounded-card border border-line bg-white p-4 shadow-card md:grid md:grid-cols-[1fr_1fr_1fr_auto_auto]"
      >
        {filterFields}
        <Button type="submit" variant="secondary">
          Primijeni
        </Button>
      </form>

      {/* Mobile: gumb + drawer */}
      <div className="flex items-center justify-between gap-3 md:hidden">
        <Button type="button" variant="outline" onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen}>
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filteri{activeCount > 0 ? ` (${activeCount})` : ""}
        </Button>
        <SortSelect value={current.sort} onChange={setSort} />
      </div>
      <div className="mt-3 hidden justify-end md:flex">
        <SortSelect value={current.sort} onChange={setSort} />
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Filteri">
          <button
            type="button"
            aria-label="Zatvori filtere"
            className="absolute inset-0 bg-plum/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-ivory p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-plum">Filteri</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Zatvori"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand"
              >
                <X className="h-5 w-5 text-plum" aria-hidden="true" />
              </button>
            </div>
            <form action={apply} className="grid gap-4">
              {filterFields}
              <Button type="submit" size="lg" className="w-full">
                Prikaži rezultate
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SortSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm font-semibold text-muted">
        Sortiraj:
      </label>
      <Select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-auto min-w-40"
      >
        <option value="">Preporučeno</option>
        <option value="featured">Istaknuto</option>
        <option value="newest">Najnovije</option>
        <option value="price_asc">Najniža cijena</option>
      </Select>
    </div>
  );
}
