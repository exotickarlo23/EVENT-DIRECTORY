import { getAdminListings } from "@/lib/admin-queries";
import { ButtonLink, Input, Select, Button } from "@/components/ui";
import { ListingsTable } from "./listings-table";
import { LISTING_STATUSES } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Na pregledu",
  published: "Objavljeno",
  paused: "Pauzirano",
  archived: "Arhivirano",
};

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminOglasiPage({ searchParams }: Props) {
  const sp = await searchParams;
  const listings = getAdminListings({ status: sp.status, q: sp.q });

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

      <ListingsTable listings={listings} />
    </div>
  );
}
