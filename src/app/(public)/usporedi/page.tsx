import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CompareTable } from "./compare-table";

export const metadata: Metadata = {
  title: "Usporedba oglasa",
  robots: { index: false, follow: true },
};

export default function UsporediPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Usporedba" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-4xl">Usporedi oglase</h1>
      <p className="mt-2 max-w-xl text-muted">
        Usporedi do četiri oglasa po cijeni, lokaciji i mogućnostima. Najkorisnije je uspoređivati
        oglase iz iste kategorije.
      </p>
      <div className="mt-8">
        <CompareTable />
      </div>
    </div>
  );
}
