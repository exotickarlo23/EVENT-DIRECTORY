import Image from "next/image";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/category-icon";

/**
 * Naslovna slika oglasa u konzistentnom omjeru 4:3.
 * Ako oglas nema fotografiju, prikazuje se brendirani placeholder
 * (deterministički gradijent po slugu + ikona kategorije) — demo podaci
 * namjerno ne koriste tuđe fotografije.
 */
const GRADIENTS = [
  "from-[#43254f] to-[#25756f]",
  "from-[#f45f5a] to-[#f3c85b]",
  "from-[#25756f] to-[#2e1838]",
  "from-[#2e1838] to-[#f45f5a]",
  "from-[#f3c85b] to-[#f45f5a]",
  "from-[#43254f] to-[#f45f5a]",
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function ListingImage({
  src,
  alt,
  seed,
  categoryIcon,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: {
  src: string | null;
  alt: string;
  seed: string;
  categoryIcon?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <div className={cn("relative aspect-[4/3] overflow-hidden bg-sand", className)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  const gradient = GRADIENTS[hashString(seed) % GRADIENTS.length];
  return (
    <div
      role="img"
      aria-label={alt}
      className={cn(
        "relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br",
        gradient,
        className
      )}
    >
      {/* suptilan konfeti uzorak */}
      <svg className="absolute inset-0 h-full w-full opacity-20" aria-hidden="true">
        <defs>
          <pattern id={`confetti-${hashString(seed)}`} width="56" height="56" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="10" r="2" fill="#fff" />
            <rect x="34" y="22" width="5" height="5" rx="1" fill="#fff" transform="rotate(20 36 24)" />
            <circle cx="46" cy="46" r="1.6" fill="#fff" />
            <path d="M18 40l2.5 5h-5z" fill="#fff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#confetti-${hashString(seed)})`} />
      </svg>
      <CategoryIcon icon={categoryIcon} className="h-12 w-12 text-white/85" />
    </div>
  );
}
