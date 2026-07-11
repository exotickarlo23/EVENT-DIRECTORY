"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { ListingImage } from "@/components/listing-image";
import type { MediaItem } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

/**
 * Galerija oglasa. Za oglase bez fotografija prikazuje brendirani placeholder.
 * Slike se učitavaju lijeno; glavna slika ima prioritet (LCP).
 */
export function ListingGallery({
  media,
  coverImage,
  name,
  slug,
  categoryIcon,
}: {
  media: MediaItem[];
  coverImage: string | null;
  name: string;
  slug: string;
  categoryIcon?: string | null;
}) {
  const images = [
    ...(coverImage ? [{ id: 0, url: coverImage, alt: name }] : []),
    ...media.filter((m) => m.kind === "image").map((m) => ({ id: m.id, url: m.url, alt: m.alt || name })),
  ];
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <ListingImage
        src={null}
        alt={`${name} — naslovna fotografija nije dostupna`}
        seed={slug}
        categoryIcon={categoryIcon}
        className="rounded-card"
        priority
      />
    );
  }

  const current = images[Math.min(active, images.length - 1)]!;

  return (
    <div>
      <ListingImage
        src={current.url}
        alt={current.alt}
        seed={slug}
        categoryIcon={categoryIcon}
        className="rounded-card"
        sizes="(max-width: 1024px) 100vw, 60vw"
        priority
      />
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Fotografije">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Fotografija ${i + 1} od ${images.length}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2",
                i === active ? "border-coral" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <ListingImage src={img.url} alt="" seed={slug} className="!aspect-auto h-full" sizes="80px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // korisnik odustao — fallback na copy
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={onShare}
      aria-label="Podijeli oglas"
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-plum hover:border-plum"
    >
      {copied ? <Check className="h-5 w-5 text-teal" aria-hidden="true" /> : <Share2 className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
