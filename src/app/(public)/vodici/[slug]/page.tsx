import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { absoluteUrl, siteConfig } from "@/config/site";
import {
  getPostBySlug,
  getPublishedPosts,
  getCategoryBySlug,
  getListings,
  getListingCardsByIds,
} from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Markdown, extractHeadings } from "@/lib/markdown";
import { Faq, type FaqItem } from "@/components/faq";
import { JsonLd } from "@/components/json-ld";
import { SectionHeading, ButtonLink } from "@/components/ui";
import { ListingGrid } from "@/components/listing-card";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    alternates: { canonical: absoluteUrl(`/vodici/${slug}`) },
    openGraph: {
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author],
    },
  };
}

export default async function VodicPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const headings = extractHeadings(post.content);
  const faq: FaqItem[] = (() => {
    try {
      return JSON.parse(post.faq ?? "[]") as FaqItem[];
    } catch {
      return [];
    }
  })();
  const relatedSlugs: string[] = (() => {
    try {
      return JSON.parse(post.relatedCategorySlugs ?? "[]") as string[];
    } catch {
      return [];
    }
  })();
  const relatedCategoriesResolved = await Promise.all(relatedSlugs.map((s) => getCategoryBySlug(s)));
  const relatedCategories = relatedCategoriesResolved.filter(
    (c): c is NonNullable<Awaited<ReturnType<typeof getCategoryBySlug>>> => c != null
  );
  const relatedIdsNested = await Promise.all(
    relatedSlugs.map(async (s) => (await getListings({ categorySlug: s, limit: 2 })).items.map((l) => l.id))
  );
  const relatedListingIds = relatedIdsNested.flat();
  const relatedListings = await getListingCardsByIds([...new Set(relatedListingIds)].slice(0, 3));
  const otherPosts = (await getPublishedPosts()).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Vodiči", href: "/vodici" }, { name: post.title }]} />
      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        <article>
          {post.categoryName ? (
            <p className="text-sm font-bold uppercase tracking-wide text-teal">{post.categoryName}</p>
          ) : null}
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-plum md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-muted">
            {post.author} · Objavljeno {formatDate(post.publishedAt)}
            {post.updatedAt !== post.publishedAt ? ` · Ažurirano ${formatDate(post.updatedAt)}` : ""}
          </p>
          <p className="mt-5 text-lg leading-relaxed text-muted">{post.excerpt}</p>

          <div className="mt-8">
            <Markdown content={post.content} />
          </div>

          <Faq items={faq} />

          {relatedCategories.length > 0 ? (
            <div className="mt-10 rounded-card bg-plum p-6 text-center md:p-8">
              <h2 className="font-display text-xl font-bold text-white md:text-2xl">
                Spreman/na za sljedeći korak?
              </h2>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {relatedCategories.map((c) => (
                  <ButtonLink key={c.slug} href={`/usluge/${c.slug}`} size="sm">
                    {c.name}
                  </ButtonLink>
                ))}
              </div>
            </div>
          ) : null}
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {headings.length > 1 ? (
            <nav aria-label="Sadržaj članka" className="rounded-card border border-line bg-white p-5 shadow-card">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">Sadržaj</h2>
              <ol className="space-y-2">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`} className="text-sm font-semibold text-plum hover:text-coral">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          {otherPosts.length > 0 ? (
            <div className="mt-6 rounded-card border border-line bg-white p-5 shadow-card">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
                Povezani vodiči
              </h2>
              <ul className="space-y-3">
                {otherPosts.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/vodici/${p.slug}`} className="text-sm font-semibold text-plum hover:text-coral">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      {relatedListings.length > 0 ? (
        <section className="mt-16">
          <SectionHeading title="Ponuđači koji ti mogu pomoći" />
          <ListingGrid listings={relatedListings} />
        </section>
      ) : null}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          author: { "@type": "Organization", name: post.author },
          publisher: { "@type": "Organization", name: siteConfig.name },
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          mainEntityOfPage: absoluteUrl(`/vodici/${slug}`),
          inLanguage: "hr",
        }}
      />
    </div>
  );
}
