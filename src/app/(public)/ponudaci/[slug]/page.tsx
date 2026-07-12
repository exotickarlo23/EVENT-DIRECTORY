import { notFound, permanentRedirect } from "next/navigation";
import { getListingBySlug } from "@/lib/queries";
import { listingCanonicalSlugs } from "@/components/listing-detail";
import { listingPath } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Naslijeđeni plitki URL oglasa — trajno (301) preusmjerava na kanonski
 * /usluge/[kategorija]/[lokacija]/[ime]. Zadržan radi starih linkova.
 */
export default async function LegacyListingRedirect({ params }: Props) {
  const { slug } = await params;
  const listing = getListingBySlug(slug);
  if (!listing) notFound();
  permanentRedirect(listingPath({ slug: listing.slug, ...listingCanonicalSlugs(listing) }));
}
