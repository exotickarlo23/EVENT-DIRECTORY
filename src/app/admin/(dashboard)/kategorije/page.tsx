import { getCategoriesWithCounts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminKategorijePage() {
  const categories = await getCategoriesWithCounts();
  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 font-display text-2xl font-bold text-plum md:text-3xl">Kategorije</h1>
      <p className="mb-6 text-sm text-muted">
        Pregled taksonomije (uređivanje kategorija kroz sučelje stiže u fazi 2 — za sada se
        dodaju kroz seed ili izravno u bazi).
      </p>
      <div className="rounded-card border border-line bg-white shadow-card">
        <ul className="divide-y divide-line">
          {categories.map((c) => (
            <li key={c.id} className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-plum">{c.name}</p>
                <p className="text-sm text-muted">
                  /usluge/{c.slug} · {c.listingCount} oglasa
                </p>
              </div>
              {c.children.length > 0 ? (
                <p className="mt-1 text-sm text-muted">
                  Podkategorije: {c.children.map((ch) => ch.name).join(", ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
