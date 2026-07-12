import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { absoluteUrl } from "@/config/site";
import { getListingBySlug } from "@/lib/queries";
import { recordListingView } from "@/lib/actions/public";
import { ListingDetailView, listingCanonicalSlugs } from "@/components/listing-detail";
import { listingPath } from "@/lib/utils";

export const dynamic = "force-dynamic"; // broji preglede po posjetu

interface Props {
  params: Promise<{ category: string; location: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return {};
  const canonical = listingPath({ slug: listing.slug, ...listingCanonicalSlugs(listing) });
  return {
    title:
      listing.seoTitle ??
      `${listing.name}${listing.baseLocation ? ` — ${listing.baseLocation.name}` : ""}`,
    description:
      listing.seoDescription ??
      `${listing.shortDescription} Pogledaj ponudu, cijene i pošalji izravan upit preko slavimo.hr.`,
    alternates: { canonical: listing.canonicalOverride ?? absoluteUrl(canonical) },
  };
}

export default async function ListingCanonicalPage({ params }: Props) {
  const { category, location, slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  // Kanonski URL se izvodi iz podataka; svaka druga kombinacija kategorije/lokacije
  // (ili stari link) trajno (301) preusmjerava na kanonski put.
  const slugs = listingCanonicalSlugs(listing);
  const canonicalCategory = slugs.categorySlug || "ostalo";
  const canonicalLocation = slugs.locationSlug || "hrvatska";
  if (category !== canonicalCategory || location !== canonicalLocation) {
    permanentRedirect(listingPath({ slug: listing.slug, ...slugs }));
  }

  await recordListingView(listing.id, listingPath({ slug: listing.slug, ...slugs }));

  return (
    <ListingDetailView listing={listing} canonicalPath={listingPath({ slug: listing.slug, ...slugs })} />
  );
}
