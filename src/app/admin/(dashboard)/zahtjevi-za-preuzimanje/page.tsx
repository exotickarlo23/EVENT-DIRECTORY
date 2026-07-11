import Link from "next/link";
import { getAdminClaims } from "@/lib/admin-queries";
import { setClaimStatus } from "@/lib/actions/admin";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, { label: string; variant: "warning" | "neutral" | "success" | "danger" }> = {
  pending: { label: "Novo", variant: "warning" },
  under_review: { label: "U obradi", variant: "neutral" },
  approved: { label: "Odobreno", variant: "success" },
  rejected: { label: "Odbijeno", variant: "danger" },
};

export default function AdminZahtjeviPage() {
  const items = getAdminClaims();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-plum md:text-3xl">
        Zahtjevi za preuzimanje ({items.length})
      </h1>
      {items.length === 0 ? (
        <p className="rounded-card border border-line bg-white p-8 text-center text-muted shadow-card">
          Nema zahtjeva za preuzimanje profila.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((claim) => {
            const badge = STATUS_BADGE[claim.status] ?? STATUS_BADGE.pending!;
            return (
              <div key={claim.id} className="rounded-card border border-line bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-plum">
                    {claim.fullName} ·{" "}
                    <a href={`mailto:${claim.email}`} className="text-teal underline">
                      {claim.email}
                    </a>
                    {claim.phone ? ` · ${claim.phone}` : ""}
                  </p>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">
                  Oglas:{" "}
                  {claim.listingSlug ? (
                    <Link href={`/ponudaci/${claim.listingSlug}`} target="_blank" className="font-semibold text-teal underline">
                      {claim.listingName}
                    </Link>
                  ) : (
                    claim.listingName ?? "—"
                  )}{" "}
                  ·{" "}
                  <Link href={`/admin/oglasi/${claim.listingId}`} className="underline">
                    uredi oglas
                  </Link>
                </p>
                <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm text-ink sm:grid-cols-2">
                  {claim.role ? <Row label="Funkcija" value={claim.role} /> : null}
                  {claim.website ? <Row label="Web/mreža" value={claim.website} /> : null}
                  {claim.proofMethod ? <Row label="Dokaz vlasništva" value={claim.proofMethod} /> : null}
                </dl>
                {claim.message ? <p className="mt-2 text-sm text-ink">{claim.message}</p> : null}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted">{formatDate(claim.createdAt)}</p>
                  {claim.status === "pending" || claim.status === "under_review" ? (
                    <div className="flex gap-1">
                      {claim.status === "pending" ? (
                        <form action={setClaimStatus.bind(null, claim.id, "under_review", undefined)}>
                          <button type="submit" className="rounded px-2 py-1 text-xs font-bold text-plum hover:bg-sand">
                            U obradu
                          </button>
                        </form>
                      ) : null}
                      <form action={setClaimStatus.bind(null, claim.id, "approved", undefined)}>
                        <button type="submit" className="rounded px-2 py-1 text-xs font-bold text-teal hover:bg-sand">
                          Odobri (profil → preuzet)
                        </button>
                      </form>
                      <form action={setClaimStatus.bind(null, claim.id, "rejected", undefined)}>
                        <button type="submit" className="rounded px-2 py-1 text-xs font-bold text-coral-dark hover:bg-sand">
                          Odbij
                        </button>
                      </form>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="font-semibold text-muted">{label}:</dt>
      <dd>{value}</dd>
    </div>
  );
}
