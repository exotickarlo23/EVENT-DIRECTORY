"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, Check, Tag } from "lucide-react";
import { Label, Select, Button } from "@/components/ui";
import { trackEvent } from "@/lib/actions/public";
import { cn, pluralOglas } from "@/lib/utils";
import type { NavTaxonomyItem } from "@/components/header";

export interface CategoryOption {
  slug: string;
  name: string;
  count: number;
}

const POPULAR_SEARCHES: { label: string; href: string }[] = [
  { label: "Napuhanci Zagreb", href: "/usluge/napuhanci-i-atrakcije/zagreb" },
  { label: "Animatori", href: "/usluge/animatori-i-maskote" },
  { label: "Photobooth", href: "/usluge/photobooth-i-360-video" },
  { label: "Catering", href: "/usluge/catering-i-hrana" },
  { label: "Prostori za proslave", href: "/usluge/prostori-za-proslave" },
];

export function HeroSearch({
  categories,
  locations,
  compact = false,
}: {
  categories: CategoryOption[];
  locations: NavTaxonomyItem[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryOption | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const lokacija = String(form.get("lokacija") ?? "");
    void trackEvent("search_submitted", undefined, `${category?.slug ?? ""}|${lokacija}`);
    if (category && lokacija) router.push(`/usluge/${category.slug}/${lokacija}`);
    else if (category) router.push(`/usluge/${category.slug}`);
    else if (lokacija) router.push(`/lokacije/${lokacija}`);
    else router.push("/usluge");
  }

  return (
    <div>
      <form
        onSubmit={onSubmit}
        role="search"
        aria-label="Pretraga event-usluga"
        className="rounded-card border border-line bg-white p-4 shadow-card-hover md:p-5"
      >
        <div className="grid gap-3 md:grid-cols-[1.6fr_1fr_auto] md:items-end">
          <div>
            <Label htmlFor="hero-cat-btn">Što tražiš?</Label>
            <CategoryPicker categories={categories} value={category} onChange={setCategory} />
          </div>
          <div>
            <Label htmlFor="hero-lokacija">Gdje?</Label>
            <Select id="hero-lokacija" name="lokacija" defaultValue="">
              <option value="">Grad ili županija</option>
              {locations.map((l) => (
                <option key={l.slug} value={l.slug}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" size="lg" className="btn-shine w-full md:w-auto">
            <Search className="h-4 w-4" aria-hidden="true" />
            Pronađi uslugu
          </Button>
        </div>
      </form>
      {!compact ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-white/80">Popularno:</span>
          {POPULAR_SEARCHES.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              {s.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Pristupačan dropdown za odabir kategorije s brojem oglasa (uz filter). */
function CategoryPicker({
  categories,
  value,
  onChange,
}: {
  categories: CategoryOption[];
  value: CategoryOption | null;
  onChange: (c: CategoryOption | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) searchRef.current?.focus();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setQuery("");
  }, [open]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        id="hero-cat-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-left text-sm text-ink focus:border-coral focus:outline-none"
      >
        <span className={cn("flex items-center gap-2 truncate", !value && "text-muted")}>
          <Tag className="h-4 w-4 shrink-0 text-coral" aria-hidden="true" />
          {value ? value.name : "Odaberite kategoriju…"}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-line bg-white shadow-card-hover">
          <div className="border-b border-line p-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pretraži kategorije…"
              aria-label="Pretraži kategorije"
              className="w-full rounded-lg bg-sand px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
            />
          </div>
          <ul role="listbox" aria-label="Kategorije" className="max-h-72 overflow-y-auto py-1">
            {value ? (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm font-semibold text-muted hover:bg-sand"
                >
                  Sve kategorije
                </button>
              </li>
            ) : null}
            {filtered.map((c) => {
              const selected = value?.slug === c.slug;
              return (
                <li key={c.slug} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex min-h-11 w-full items-center justify-between gap-3 px-4 py-2 text-sm hover:bg-sand",
                      selected && "bg-sand"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate text-ink">
                      {selected ? (
                        <Check className="h-4 w-4 shrink-0 text-coral" aria-hidden="true" />
                      ) : null}
                      {c.name}
                    </span>
                    <span className="shrink-0 text-xs font-bold text-coral" aria-label={pluralOglas(c.count)}>
                      {c.count}
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted">Nema kategorije za „{query}”</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
