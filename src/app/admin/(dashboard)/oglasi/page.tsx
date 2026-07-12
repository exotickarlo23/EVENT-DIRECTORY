import Link from "next/link";
import { getAdminListings } from "@/lib/admin-queries";
import { ButtonLink, Badge, Input, Select, Button } from "@/components/ui";
import { RowActions } from "./row-actions";
import { formatDate, isFeaturedActive } from "@/lib/utils";
import { LISTING_STATUSES } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

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

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminOglasiPage({ searchParams }: Props) {
  const sp = await searchParams;
  const listings = await getAdminListings({ status: sp.status, q: sp.q });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-plum md:text-3xl">
          Oglasi ({listings.length})
        </h1>
        <div className="flex gap-2">
          <ButtonLink href="/admin/import" variant="outline">
            CSV import
          </ButtonLink>
          <ButtonLink href="/admin/oglasi/novi">+ Novi oglas</ButtonLink>
        </div>
      </div>

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs">
          <Input name="q" placeholder="Traži po nazivu ili slugu…" defaultValue={sp.q ?? ""} aria-label="Pretraga oglasa" />
        </div>
        <Select name="status" defaultValue={sp.status ?? ""} className="w-auto" aria-label="Filtriraj po statusu">
          <option value="">Svi statusi</option>
          {LISTING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary" size="sm">
          Filtriraj
        </Button>
      </form>

      <div className="overflow-x-auto rounded-card border border-line bg-white shadow-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-muted">
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
            {listings.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0 hover:bg-sand/40">
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
            ))}
            {listings.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted">
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
