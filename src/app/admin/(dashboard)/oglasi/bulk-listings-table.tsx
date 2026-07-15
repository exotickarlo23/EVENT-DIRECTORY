"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Badge, Button, Select } from "@/components/ui";
import { RowActions } from "./row-actions";
import { formatDate, isFeaturedActive, pluralOglas } from "@/lib/utils";
import {
  bulkSetListingStatus,
  bulkSetListingTier,
  bulkSetPrimaryCategory,
  bulkSetBaseLocation,
  bulkDeleteListings,
  type BulkResult,
} from "@/lib/actions/admin";
import type { ListingStatus, ListingTier } from "@/lib/db/schema";

interface Row {
  id: number;
  name: string;
  slug: string;
  status: string;
  tier: string;
  featuredFrom: string | null;
  featuredUntil: string | null;
  categoryName: string | null;
  locationName: string | null;
  viewCount: number;
  leadCount: number;
  updatedAt: string;
}

interface Option {
  id: number;
  name: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Na pregledu",
  published: "Objavljeno",
  paused: "Pauzirano",
  archived: "Arhivirano",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "neutral" | "danger"> = {
  published: "success",
  draft: "neutral",
  pending_review: "warning",
  paused: "warning",
  archived: "danger",
};

export function BulkListingsTable({
  listings,
  categories,
  locations,
}: {
  listings: Row[];
  categories: Option[];
  locations: Option[];
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const [statusValue, setStatusValue] = useState("");
  const [tierValue, setTierValue] = useState("");
  const [categoryValue, setCategoryValue] = useState("");
  const [locationValue, setLocationValue] = useState("");

  const allIds = useMemo(() => listings.map((l) => l.id), [listings]);
  const allSelected = selected.size > 0 && selected.size === listings.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function run(fn: () => Promise<BulkResult>, opts?: { clearSelection?: boolean }) {
    setFeedback(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) {
        setFeedback({ ok: true, text: `Ažurirano: ${pluralOglas(res.affected ?? 0)}.` });
        if (opts?.clearSelection) setSelected(new Set());
      } else {
        setFeedback({ ok: false, text: res.error ?? "Došlo je do pogreške." });
      }
    });
  }

  const ids = () => Array.from(selected);

  return (
    <div>
      {selected.size > 0 ? (
        <div className="sticky top-0 z-10 mb-4 rounded-card border border-line bg-white p-3 shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-plum">
              Odabrano: {selected.size}
            </span>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs font-bold text-muted hover:text-coral"
            >
              Poništi odabir
            </button>

            <span className="mx-1 h-5 w-px bg-line" />

            {/* Status */}
            <div className="flex items-center gap-1">
              <Select
                aria-label="Novi status"
                className="w-auto"
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
              >
                <option value="">Postavi status…</option>
                {Object.entries(STATUS_LABELS).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending || !statusValue}
                onClick={() => run(() => bulkSetListingStatus(ids(), statusValue as ListingStatus))}
              >
                Primijeni
              </Button>
            </div>

            {/* Tier */}
            <div className="flex items-center gap-1">
              <Select
                aria-label="Novi tier"
                className="w-auto"
                value={tierValue}
                onChange={(e) => setTierValue(e.target.value)}
              >
                <option value="">Postavi tier…</option>
                <option value="free">Free</option>
                <option value="featured">Istaknuto</option>
              </Select>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending || !tierValue}
                onClick={() => run(() => bulkSetListingTier(ids(), tierValue as ListingTier))}
              >
                Primijeni
              </Button>
            </div>

            {/* Kategorija */}
            <div className="flex items-center gap-1">
              <Select
                aria-label="Nova kategorija"
                className="w-auto"
                value={categoryValue}
                onChange={(e) => setCategoryValue(e.target.value)}
              >
                <option value="">Postavi kategoriju…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending || !categoryValue}
                onClick={() => run(() => bulkSetPrimaryCategory(ids(), Number(categoryValue)))}
              >
                Primijeni
              </Button>
            </div>

            {/* Lokacija */}
            <div className="flex items-center gap-1">
              <Select
                aria-label="Nova lokacija"
                className="w-auto"
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
              >
                <option value="">Postavi lokaciju…</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={pending || !locationValue}
                onClick={() => run(() => bulkSetBaseLocation(ids(), Number(locationValue)))}
              >
                Primijeni
              </Button>
            </div>

            <span className="mx-1 h-5 w-px bg-line" />

            {/* Brisanje */}
            <Button
              type="button"
              size="sm"
              variant="primary"
              disabled={pending}
              onClick={() => {
                if (
                  window.confirm(
                    `Trajno izbrisati ${pluralOglas(selected.size)}? Ova radnja se ne može poništiti.`
                  )
                ) {
                  run(() => bulkDeleteListings(ids()), { clearSelection: true });
                }
              }}
            >
              Izbriši odabrano
            </Button>
          </div>

          {feedback ? (
            <p className={`mt-2 text-sm ${feedback.ok ? "text-teal" : "text-coral-dark"}`}>
              {feedback.text}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-card border border-line bg-white shadow-card">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-muted">
              <th className="w-10 p-3">
                <input
                  type="checkbox"
                  aria-label="Odaberi sve oglase"
                  className="h-4 w-4 accent-coral"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                />
              </th>
              <th className="p-3">Naziv</th>
              <th className="p-3">Status</th>
              <th className="p-3">Tier</th>
              <th className="p-3">Kategorija</th>
              <th className="p-3">Lokacija</th>
              <th className="p-3">Pregledi</th>
              <th className="p-3">Upiti</th>
              <th className="p-3">Ažurirano</th>
              <th className="p-3">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => {
              const isSel = selected.has(l.id);
              return (
                <tr
                  key={l.id}
                  className={`border-b border-line last:border-0 hover:bg-sand/40 ${isSel ? "bg-sand/50" : ""}`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      aria-label={`Odaberi ${l.name}`}
                      className="h-4 w-4 accent-coral"
                      checked={isSel}
                      onChange={() => toggleOne(l.id)}
                    />
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/oglasi/${l.id}`} className="font-bold text-plum hover:text-coral">
                      {l.name}
                    </Link>
                    <p className="text-xs text-muted">/{l.slug}</p>
                  </td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[l.status] ?? "neutral"}>{STATUS_LABELS[l.status]}</Badge>
                  </td>
                  <td className="p-3">
                    {l.tier === "featured" ? (
                      <Badge variant="featured">{isFeaturedActive(l) ? "Istaknuto" : "Istaknuto (neaktivno)"}</Badge>
                    ) : (
                      <span className="text-muted">Free</span>
                    )}
                  </td>
                  <td className="p-3 text-muted">{l.categoryName ?? "—"}</td>
                  <td className="p-3 text-muted">{l.locationName ?? "—"}</td>
                  <td className="p-3 text-muted">{l.viewCount}</td>
                  <td className="p-3 text-muted">{l.leadCount}</td>
                  <td className="p-3 text-xs text-muted">{formatDate(l.updatedAt)}</td>
                  <td className="p-3">
                    <RowActions id={l.id} status={l.status} slug={l.slug} />
                  </td>
                </tr>
              );
            })}
            {listings.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-muted">
                  Nema oglasa za zadani filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
