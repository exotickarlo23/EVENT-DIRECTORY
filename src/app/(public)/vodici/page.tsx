import type { Metadata } from "next";
import { absoluteUrl } from "@/config/site";
import { getPublishedPosts, getBlogCategories } from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GuideCard } from "@/components/guide-card";
import { EmptyState, ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "Vodiči — lakše organiziraj svoj događaj",
  description:
    "Praktični vodiči, ideje i stvarne informacije o cijenama, rezervacijama i organizaciji proslava i događaja.",
  alternates: { canonical: absoluteUrl("/vodici") },
};

export default function VodiciPage() {
  const posts = getPublishedPosts();
  const categories = getBlogCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Vodiči" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-5xl">
        Lakše organiziraj svoj događaj
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">
        Praktični vodiči, ideje i stvarne informacije o cijenama, rezervacijama i organizaciji.
      </p>

      {categories.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.slug} className="rounded-full bg-sand px-3 py-1.5 text-xs font-bold text-plum">
              {c.name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-10">
        {posts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <GuideCard key={post.slug} post={post} priority={i < 3} />
            ))}
          </div>
        ) : (
          <EmptyState title="Vodiči uskoro stižu" text="Radimo na prvim vodičima za organizaciju događaja.">
            <ButtonLink href="/usluge">Pronađi uslugu</ButtonLink>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
