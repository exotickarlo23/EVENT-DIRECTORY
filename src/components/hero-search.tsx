"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Label, Select, Input, Button } from "@/components/ui";
import { trackEvent } from "@/lib/actions/public";
import type { NavTaxonomyItem } from "@/components/header";

const POPULAR_SEARCHES: { label: string; href: string }[] = [
  { label: "Napuhanci Zagreb", href: "/usluge/napuhanci-i-atrakcije/zagreb" },
  { label: "Animatori", href: "/usluge/animatori-i-maskote" },
  { label: "Photobooth", href: "/usluge/photobooth-i-360-video" },
  { label: "Catering", href: "/usluge/catering-i-hrana" },
  { label: "Prostori za proslave", href: "/usluge/prostori-za-proslave" },
];

export function HeroSearch({
  locations,
  compact = false,
}: {
  locations: NavTaxonomyItem[];
  compact?: boolean;
}) {
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const q = String(form.get("q") ?? "").trim();
    const lokacija = String(form.get("lokacija") ?? "");
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (lokacija) params.set("lokacija", lokacija);
    void trackEvent("search_submitted", undefined, params.toString());
    router.push(`/pretraga?${params.toString()}`);
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
            <Label htmlFor="hero-q">Što tražiš?</Label>
            <Input
              id="hero-q"
              name="q"
              type="search"
              placeholder="Napuhanci, fotograf, catering…"
              autoComplete="off"
            />
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
          <Button type="submit" size="lg" className="w-full md:w-auto">
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
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              {s.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
