import { getLocationsWithCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminLokacijePage() {
  const locations = await getLocationsWithCounts();
  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 font-display text-2xl font-bold text-plum md:text-3xl">Lokacije</h1>
      <p className="mb-6 text-sm text-muted">
        Pregled lokacija (uređivanje kroz sučelje stiže u fazi 2).
      </p>
      <div className="rounded-card border border-line bg-white shadow-card">
        <ul className="divide-y divide-line">
          {locations.map((l) => (
            <li key={l.id} className="flex items-center justify-between p-4">
              <p className="font-bold text-plum">{l.name}</p>
              <p className="text-sm text-muted">
                {l.county} · {l.listingCount} oglasa
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
