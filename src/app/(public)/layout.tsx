import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  getCategoriesWithCounts,
  getOccasions,
  getLocationsWithCounts,
  getPublishedPosts,
} from "@/lib/queries";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = getCategoriesWithCounts().map((c) => ({ slug: c.slug, name: c.name }));
  const occasions = getOccasions().map((o) => ({ slug: o.slug, name: o.name }));
  const locations = getLocationsWithCounts()
    .filter((l) => l.listingCount > 0)
    .map((l) => ({ slug: l.slug, name: l.name }));
  const guides = getPublishedPosts(3).map((p) => ({ slug: p.slug, name: p.title }));

  return (
    <>
      <Header categories={categories} occasions={occasions} />
      <main id="glavni-sadrzaj" className="min-h-[60vh]">
        {children}
      </main>
      <Footer categories={categories} locations={locations} occasions={occasions} guides={guides} />
    </>
  );
}
