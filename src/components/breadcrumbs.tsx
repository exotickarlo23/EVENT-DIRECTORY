import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl } from "@/config/site";

export interface Crumb {
  name: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ name: "Naslovnica", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Navigacijski put" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
          {all.map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
              {item.href && i < all.length - 1 ? (
                <Link href={item.href} className="hover:text-plum hover:underline">
                  {item.name}
                </Link>
              ) : (
                <span aria-current="page" className="font-semibold text-plum">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            ...(item.href ? { item: absoluteUrl(item.href) } : {}),
          })),
        }}
      />
    </>
  );
}
