import Link from "next/link";
import { ListingImage } from "@/components/listing-image";
import type { BlogPost } from "@/lib/db/schema";

type GuidePost = BlogPost & { categoryName?: string | null };

/**
 * Kartica vodiča sa slikom-preview (naslovna fotografija ili brendirani
 * placeholder) i naslovom. Cijela kartica je klikabilna.
 */
export function GuideCard({ post, priority = false }: { post: GuidePost; priority?: boolean }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
      <ListingImage
        src={post.coverImage}
        alt={post.title}
        seed={post.slug}
        categoryIcon="book"
        priority={priority}
        className="transition-transform duration-300 group-hover:scale-[1.02]"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="flex flex-1 flex-col p-5">
        {post.categoryName ? (
          <p className="text-xs font-bold uppercase tracking-wide text-teal">{post.categoryName}</p>
        ) : null}
        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-plum">
          <Link
            href={`/vodici/${post.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
      </div>
    </article>
  );
}
