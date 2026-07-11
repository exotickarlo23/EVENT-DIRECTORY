import { getOccasions, getListings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function AdminPrigodePage() {
  const occasions = getOccasions();
  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 font-display text-2xl font-bold text-plum md:text-3xl">Prigode</h1>
      <p className="mb-6 text-sm text-muted">
        Pregled prigoda (uređivanje kroz sučelje stiže u fazi 2).
      </p>
      <div className="rounded-card border border-line bg-white shadow-card">
        <ul className="divide-y divide-line">
          {occasions.map((o) => (
            <li key={o.id} className="flex items-center justify-between p-4">
              <p className="font-bold text-plum">{o.name}</p>
              <p className="text-sm text-muted">
                /prigode/{o.slug} · {getListings({ occasionSlug: o.slug, limit: 1 }).total} oglasa
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
