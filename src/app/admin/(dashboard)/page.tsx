import Link from "next/link";
import { getDashboardStats } from "@/lib/admin-queries";
import { ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const s = await getDashboardStats();

  const cards = [
    { label: "Aktivni oglasi", value: s.totalPublished, href: "/admin/oglasi" },
    { label: "Besplatni oglasi", value: s.freeCount, href: "/admin/oglasi" },
    { label: "Istaknuti oglasi", value: s.featuredCount, href: "/admin/oglasi" },
    { label: "Istaknuti — istječe uskoro (14 d)", value: s.featuredExpiringSoon, href: "/admin/oglasi", warn: s.featuredExpiringSoon > 0 },
    { label: "Novi upiti", value: s.newLeads, href: "/admin/upiti", warn: s.newLeads > 0 },
    { label: "Zahtjevi za preuzimanje", value: s.pendingClaims, href: "/admin/zahtjevi-za-preuzimanje", warn: s.pendingClaims > 0 },
    { label: "Prijave poslovanja", value: s.pendingSubmissions, href: "/admin/prijave-poslovanja", warn: s.pendingSubmissions > 0 },
    { label: "Pregledi oglasa (ukupno)", value: s.listingViews, href: "/admin/oglasi" },
    { label: "Klikovi na telefon", value: s.phoneClicks, href: "/admin/oglasi" },
    { label: "Klikovi na WhatsApp", value: s.whatsappClicks, href: "/admin/oglasi" },
    { label: "Poslani upiti (obrasci)", value: s.leadsSubmitted, href: "/admin/upiti" },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-plum md:text-3xl">Dashboard</h1>
        <ButtonLink href="/admin/oglasi/novi">+ Novi oglas</ButtonLink>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`rounded-card border bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover ${
              c.warn ? "border-gold" : "border-line"
            }`}
          >
            <p className="text-3xl font-bold text-plum">{c.value}</p>
            <p className="mt-1 text-sm font-semibold text-muted">{c.label}</p>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted">
        Metrike dolaze iz first-party analitike (tablica analytics_events) i baze — bez vanjskih
        servisa.
      </p>
    </div>
  );
}
