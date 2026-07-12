import { getAdminLeads } from "@/lib/admin-queries";
import { setLeadStatus } from "@/lib/actions/admin";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUpitiPage() {
  const items = await getAdminLeads();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-plum md:text-3xl">
        Upiti ({items.length})
      </h1>
      {items.length === 0 ? (
        <p className="rounded-card border border-line bg-white p-8 text-center text-muted shadow-card">
          Još nema upita.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((lead) => (
            <div key={lead.id} className="rounded-card border border-line bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-plum">
                  {lead.name} ·{" "}
                  <a href={`mailto:${lead.email}`} className="text-teal underline">
                    {lead.email}
                  </a>
                  {lead.phone ? ` · ${lead.phone}` : ""}
                </p>
                <div className="flex items-center gap-2">
                  {lead.status === "new" ? <Badge variant="warning">Novo</Badge> : null}
                  {lead.status === "read" ? <Badge variant="neutral">Pročitano</Badge> : null}
                  {lead.status === "archived" ? <Badge variant="neutral">Arhivirano</Badge> : null}
                </div>
              </div>
              <p className="mt-1 text-sm font-semibold text-muted">
                {lead.listingName ? `Oglas: ${lead.listingName}` : "Općeniti upit (kontakt stranica)"}
                {[lead.eventType, lead.eventDate, lead.eventLocation].filter(Boolean).length > 0
                  ? ` · ${[lead.eventType, lead.eventDate, lead.eventLocation].filter(Boolean).join(" · ")}`
                  : ""}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-ink">{lead.message}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted">{formatDate(lead.createdAt)}</p>
                <div className="flex gap-1">
                  {lead.status !== "read" ? (
                    <form action={setLeadStatus.bind(null, lead.id, "read")}>
                      <button type="submit" className="rounded px-2 py-1 text-xs font-bold text-teal hover:bg-sand">
                        Označi pročitano
                      </button>
                    </form>
                  ) : null}
                  {lead.status !== "archived" ? (
                    <form action={setLeadStatus.bind(null, lead.id, "archived")}>
                      <button type="submit" className="rounded px-2 py-1 text-xs font-bold text-muted hover:bg-sand">
                        Arhiviraj
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
