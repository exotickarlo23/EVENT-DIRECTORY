import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/config/site";
import { getListingBySlug } from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState, ButtonLink } from "@/components/ui";
import { listingCanonicalSlugs } from "@/components/listing-detail";
import { listingPath } from "@/lib/utils";
import { ClaimForm } from "./claim-form";

export const metadata: Metadata = {
  title: "Preuzmi oglas — poveži profil sa svojim poslovanjem",
  description:
    "Vlasnik si poslovanja s profila na Feštku? Pošalji zahtjev za preuzimanje i ažuriraj svoje podatke.",
  alternates: { canonical: absoluteUrl("/preuzmi-oglas") },
  robots: { index: false, follow: true },
};

interface Props {
  searchParams: Promise<{ listing?: string }>;
}

export default async function PreuzmiOglasPage({ searchParams }: Props) {
  const { listing: listingSlug } = await searchParams;
  const listing = listingSlug ? getListingBySlug(listingSlug) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Preuzmi oglas" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-4xl">Preuzmi ovaj profil</h1>

      {!listing ? (
        <div className="mt-8">
          <EmptyState
            title="Oglas nije pronađen"
            text="Otvori profil svog poslovanja i klikni „Preuzmi ovaj profil” — ili nas kontaktiraj ako profila još nema."
          >
            <ButtonLink href="/usluge" variant="outline">
              Pronađi svoj profil
            </ButtonLink>
            <ButtonLink href="/dodaj-poslovanje">Dodaj novo poslovanje</ButtonLink>
          </EmptyState>
        </div>
      ) : listing.claimStatus === "claimed" ? (
        <div className="mt-8">
          <EmptyState
            title="Ovaj profil je već preuzet"
            text={`Profil „${listing.name}” već je povezan s vlasnikom. Ako smatraš da je došlo do pogreške, javi nam se.`}
          >
            <ButtonLink href="/kontakt">Kontaktiraj nas</ButtonLink>
          </EmptyState>
        </div>
      ) : (
        <>
          <p className="mt-3 text-muted">
            Šalješ zahtjev za preuzimanje profila{" "}
            <Link
              href={listingPath({ slug: listing.slug, ...listingCanonicalSlugs(listing) })}
              className="font-bold text-teal underline"
            >
              {listing.name}
            </Link>
            {listing.baseLocation ? ` (${listing.baseLocation.name})` : ""}. Nakon ručne provjere
            povezujemo profil s tobom i ažuriramo podatke.
          </p>
          <div className="mt-8 rounded-card border border-line bg-white p-6 shadow-card md:p-8">
            <ClaimForm listingId={listing.id} listingName={listing.name} />
          </div>
        </>
      )}
    </div>
  );
}
