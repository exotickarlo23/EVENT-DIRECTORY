import Link from "next/link";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { absoluteUrl } from "@/config/site";
import { getLocationsWithCounts } from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { pluralOglas } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Lokacije — event-usluge po gradovima",
  description:
    "Pronađi event-usluge u svom gradu: Zagreb, Split, Rijeka, Osijek i drugi hrvatski gradovi.",
  alternates: { canonical: absoluteUrl("/lokacije") },
};

export default function LokacijePage() {
  const locations = getLocationsWithCounts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Lokacije" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-5xl">
        Pronađi usluge u svom gradu
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Ponuđači event-usluga po hrvatskim gradovima — uključujući one koji dolaze na tvoju adresu.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => (
          <Link
            key={loc.slug}
            href={`/lokacije/${loc.slug}`}
            className="group flex items-center gap-4 rounded-card border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-coral">
              <MapPin className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-bold text-plum group-hover:text-coral">{loc.name}</span>
              <span className="block text-sm text-muted">
                {loc.county}
                {loc.listingCount > 0 ? ` · ${pluralOglas(loc.listingCount)}` : ""}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
