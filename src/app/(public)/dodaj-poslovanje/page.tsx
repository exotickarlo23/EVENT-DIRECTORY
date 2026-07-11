import type { Metadata } from "next";
import { absoluteUrl } from "@/config/site";
import { getCategoriesWithCounts, getLocationsWithCounts } from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BusinessForm } from "./business-form";

export const metadata: Metadata = {
  title: "Dodaj poslovanje — besplatan profil za event-usluge",
  description:
    "Prijavi svoje event-poslovanje na Feštko: besplatan profil, ciljani upiti i vidljivost u tvojoj kategoriji i gradu.",
  alternates: { canonical: absoluteUrl("/dodaj-poslovanje") },
};

export default function DodajPoslovanjePage() {
  const categories = getCategoriesWithCounts().map((c) => ({ slug: c.slug, name: c.name }));
  const locations = getLocationsWithCounts().map((l) => ({ slug: l.slug, name: l.name }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Dodaj poslovanje" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-4xl">
        Dodaj svoje poslovanje
      </h1>
      <p className="mt-3 text-muted">
        Ispuni obrazac, a mi pripremamo tvoj profil i javljamo se prije objave. Osnovni profil je
        besplatan.
      </p>
      <div className="mt-8 rounded-card border border-line bg-white p-6 shadow-card md:p-8">
        <BusinessForm categories={categories} locations={locations} />
      </div>
    </div>
  );
}
