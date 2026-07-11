import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/config/site";
import { getPublishedPosts, getBlogCategories } from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState, ButtonLink } from "@/components/ui";
import { formatDate } from "@/lib/utils";

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
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group relative flex flex-col rounded-card border border-line bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover"
              >
                {post.categoryName ? (
                  <p className="text-xs font-bold uppercase tracking-wide text-teal">{post.categoryName}</p>
                ) : null}
                <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-plum">
                  <Link
                    href={`/vodici/${post.slug}`}
                    className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{post.excerpt}</p>
                <p className="mt-auto pt-4 text-xs text-muted">
                  {post.author} · {formatDate(post.publishedAt)}
                </p>
              </article>
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
