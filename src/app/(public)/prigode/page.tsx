import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/config/site";
import { getOccasions, getListings } from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { pluralOglas } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Prigode — usluge za svaku vrstu proslave",
  description:
    "Od dječjeg rođendana do poslovnog eventa: pronađi usluge prilagođene tvojoj prigodi na jednom mjestu.",
  alternates: { canonical: absoluteUrl("/prigode") },
};

export default function PrigodePage() {
  const occasions = getOccasions();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Prigode" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-5xl">Što slavimo?</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Odaberi prigodu i pronađi ponuđače koji imaju iskustva baš s takvim događajima.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {occasions.map((occ) => {
          const { total } = getListings({ occasionSlug: occ.slug, limit: 1 });
          return (
            <Link
              key={occ.slug}
              href={`/prigode/${occ.slug}`}
              className="group rounded-card border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
            >
              <h2 className="font-bold text-plum group-hover:text-coral">{occ.name}</h2>
              <p className="mt-1 text-sm text-muted">
                {total > 0 ? pluralOglas(total) : "Uskoro"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
