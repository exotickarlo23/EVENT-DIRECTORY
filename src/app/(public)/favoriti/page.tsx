import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FavoritesList } from "./favorites-list";

export const metadata: Metadata = {
  title: "Favoriti — spremljeni oglasi",
  robots: { index: false, follow: true },
};

export default function FavoritiPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Favoriti" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-4xl">Spremljeni oglasi</h1>
      <p className="mt-2 max-w-xl text-muted">
        Oglasi koje si spremio/la za kasnije. Favoriti se čuvaju u ovom pregledniku — nije potreban
        račun.
      </p>
      <div className="mt-8">
        <FavoritesList />
      </div>
    </div>
  );
}
