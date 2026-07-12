import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import {
  getCategoriesWithCounts,
  getOccasions,
  getLocationsWithCounts,
  getPublishedPosts,
} from "@/lib/queries";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = (await getCategoriesWithCounts()).map((c) => ({ slug: c.slug, name: c.name }));
  const occasions = (await getOccasions()).map((o) => ({ slug: o.slug, name: o.name }));
  const locations = (await getLocationsWithCounts())
    .filter((l) => l.listingCount > 0)
    .map((l) => ({ slug: l.slug, name: l.name }));
  const guides = (await getPublishedPosts(3)).map((p) => ({ slug: p.slug, name: p.title }));

  return (
    <>
      <RevealOnScroll />
      <Header categories={categories} occasions={occasions} />
      <main id="glavni-sadrzaj" className="min-h-[60vh]">
        {children}
      </main>
      <Footer categories={categories} locations={locations} occasions={occasions} guides={guides} />
    </>
  );
}
