import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = {
  title: "O nama",
  description:
    "Feštko je hrvatski katalog event-usluga: jedno mjesto za prostore, zabavu, catering, dekoracije, fotografe i opremu.",
  alternates: { canonical: absoluteUrl("/o-nama") },
};

export default function ONamaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "O nama" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-5xl">O Feštku</h1>
      <div className="prose-festko mt-6 text-ink">
        <p>
          {siteConfig.name} je nastao iz jednostavne frustracije: organizacija proslave u
          Hrvatskoj znači deset otvorenih tabova, poruke po društvenim mrežama i cijene koje se
          doznaju tek na upit.
        </p>
        <p>
          Zato gradimo jedno mjesto na kojem možeš pronaći, usporediti i kontaktirati ponuđače
          event-usluga — od napuhanaca i animatora za dječji rođendan, preko photobootha i
          bendova za vjenčanje, do catering usluga i prostora za poslovne evente.
        </p>
        <h2>U što vjerujemo</h2>
        <ul>
          <li><strong>Transparentnost</strong> — cijene prikazujemo gdje god su dostupne.</li>
          <li><strong>Izravan kontakt</strong> — spajamo te s ponuđačem, bez posrednika i provizija za korisnike.</li>
          <li><strong>Pošten prikaz</strong> — plaćeni (istaknuti) oglasi uvijek su jasno označeni.</li>
        </ul>
        <p>
          Platforma je u ranoj fazi i katalog se aktivno puni. Ako ti nešto nedostaje — javi nam
          se, tvoje povratne informacije oblikuju Feštko.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/kontakt">Kontaktiraj nas</ButtonLink>
        <ButtonLink href="/postani-partner" variant="outline">
          Postani partner
        </ButtonLink>
      </div>
    </div>
  );
}
