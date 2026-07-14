"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui";
import { RowActions } from "./row-actions";
import { bulkUpdateListings, type BulkAction } from "@/lib/actions/admin";
import { formatDate, isFeaturedActive } from "@/lib/utils";
import type { AdminListingRow } from "@/lib/admin-queries";

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

const BULK_ACTIONS: { value: BulkAction; label: string; danger?: boolean }[] = [
  { value: "publish", label: "Objavi" },
  { value: "pause", label: "Pauziraj" },
  { value: "draft", label: "Vrati u draft" },
  { value: "archive", label: "Arhiviraj" },
  { value: "feature", label: "Označi kao istaknuto" },
  { value: "unfeature", label: "Makni isticanje" },
  { value: "delete", label: "Izbriši", danger: true },
];

export function ListingsTable({ listings }: { listings: AdminListingRow[] }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [action, setAction] = useState<BulkAction | "">("");
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  const ids = useMemo(() => listings.map((l) => l.id), [listings]);
  const allSelected = ids.length > 0 && selected.size === ids.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === ids.length ? new Set() : new Set(ids)));
  }

  function applyBulk() {
    if (!action || selected.size === 0) return;
    const chosen = BULK_ACTIONS.find((a) => a.value === action);
    if (action === "delete") {
      if (!window.confirm(`Trajno izbrisati ${selected.size} oglasa? Ova radnja se ne može poništiti.`)) {
        return;
      }
    }
    const target = Array.from(selected);
    setNotice(null);
    startTransition(async () => {
      const res = await bulkUpdateListings(target, action);
      setSelected(new Set());
      setAction("");
      setNotice(`${chosen?.label ?? "Radnja"} — primijenjeno na ${res.affected} oglasa.`);
    });
  }

  return (
    <div>
      {selected.size > 0 ? (
        <div className="sticky top-2 z-10 mb-3 flex flex-wrap items-center gap-3 rounded-card border border-plum/20 bg-plum/5 px-4 py-3 shadow-card">
          <span className="text-sm font-bold text-plum">Odabrano: {selected.size}</span>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as BulkAction | "")}
            className="min-h-9 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink"
            aria-label="Skupna radnja"
          >
            <option value="">— odaberi radnju —</option>
            {BULK_ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!action || pending}
            onClick={applyBulk}
            className="min-h-9 rounded-full bg-coral px-4 py-1.5 text-sm font-bold text-white hover:bg-coral-dark disabled:opacity-40"
          >
            {pending ? "Primjena…" : "Primijeni"}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="min-h-9 rounded-full px-3 py-1.5 text-sm font-semibold text-muted hover:text-plum"
          >
            Poništi odabir
          </button>
        </div>
      ) : null}

      {notice ? (
        <p role="status" className="mb-3 rounded-xl bg-teal/10 px-4 py-2 text-sm font-semibold text-teal">
          {notice}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-card border border-line bg-white shadow-card">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-muted">
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-coral"
                  aria-label="Odaberi sve"
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
              const checked = selected.has(l.id);
              return (
                <tr
                  key={l.id}
                  className={`border-b border-line last:border-0 hover:bg-sand/40 ${checked ? "bg-plum/5" : ""}`}
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(l.id)}
                      className="h-4 w-4 accent-coral"
                      aria-label={`Odaberi ${l.name}`}
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
