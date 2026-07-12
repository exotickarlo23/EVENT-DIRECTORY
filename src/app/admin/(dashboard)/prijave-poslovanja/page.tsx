import Link from "next/link";
import { getAdminSubmissions } from "@/lib/admin-queries";
import { createListingFromSubmission, setSubmissionStatus } from "@/lib/actions/admin";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, { label: string; variant: "warning" | "neutral" | "success" | "danger" }> = {
  pending: { label: "Novo", variant: "warning" },
  under_review: { label: "U obradi", variant: "neutral" },
  approved: { label: "Odobreno", variant: "success" },
  rejected: { label: "Odbijeno", variant: "danger" },
};

export default async function AdminPrijavePage() {
  const items = await getAdminSubmissions();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-plum md:text-3xl">
        Prijave poslovanja ({items.length})
      </h1>
      {items.length === 0 ? (
        <p className="rounded-card border border-line bg-white p-8 text-center text-muted shadow-card">
          Nema novih prijava poslovanja.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((sub) => {
            const badge = STATUS_BADGE[sub.status] ?? STATUS_BADGE.pending!;
            return (
              <div key={sub.id} className="rounded-card border border-line bg-white p-5 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-plum">{sub.businessName}</p>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {sub.contactName} ·{" "}
                  <a href={`mailto:${sub.email}`} className="text-teal underline">
                    {sub.email}
                  </a>
                  {sub.phone ? ` · ${sub.phone}` : ""}
                </p>
                <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm text-ink sm:grid-cols-2">
                  {sub.categorySlug ? <Row label="Kategorija" value={sub.categorySlug} /> : null}
                  {sub.locationName ? <Row label="Lokacija" value={sub.locationName} /> : null}
                  {sub.serviceArea ? <Row label="Područje" value={sub.serviceArea} /> : null}
                  {sub.priceFrom ? <Row label="Cijena" value={sub.priceFrom} /> : null}
                  {sub.website ? <Row label="Web" value={sub.website} /> : null}
                  {sub.instagram ? <Row label="Instagram" value={sub.instagram} /> : null}
                  {sub.photosUrl ? <Row label="Fotografije" value={sub.photosUrl} /> : null}
                </dl>
                {sub.description ? <p className="mt-2 text-sm text-ink">{sub.description}</p> : null}
                {sub.note ? <p className="mt-1 text-sm italic text-muted">Napomena: {sub.note}</p> : null}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted">{formatDate(sub.createdAt)}</p>
                  <div className="flex gap-1">
                    {sub.createdListingId ? (
                      <Link
                        href={`/admin/oglasi/${sub.createdListingId}`}
                        className="rounded px-2 py-1 text-xs font-bold text-teal hover:bg-sand"
                      >
                        Otvori kreirani oglas →
                      </Link>
                    ) : (
                      <>
                        <form action={createListingFromSubmission.bind(null, sub.id)}>
                          <button type="submit" className="rounded px-2 py-1 text-xs font-bold text-teal hover:bg-sand">
                            Kreiraj draft oglas
                          </button>
                        </form>
                        {sub.status !== "rejected" ? (
                          <form action={setSubmissionStatus.bind(null, sub.id, "rejected")}>
                            <button type="submit" className="rounded px-2 py-1 text-xs font-bold text-coral-dark hover:bg-sand">
                              Odbij
                            </button>
                          </form>
                        ) : null}
                      </>
                    )}
                  </div>
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
      <dd className="break-all">{value}</dd>
    </div>
  );
}
