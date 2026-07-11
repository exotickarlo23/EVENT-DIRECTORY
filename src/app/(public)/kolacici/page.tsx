import type { Metadata } from "next";
import { absoluteUrl } from "@/config/site";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Kolačići",
  alternates: { canonical: absoluteUrl("/kolacici") },
};

export default function KolaciciPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Kolačići" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-4xl">Kolačići</h1>
      <div className="prose-festko mt-6 text-ink">
        <p>
          Feštko trenutno koristi minimalan broj tehničkih zapisa u pregledniku i ne koristi
          marketinške kolačiće trećih strana.
        </p>
        <h2>Što koristimo</h2>
        <ul>
          <li><strong>localStorage</strong> — za spremanje favorita i liste za usporedbu na tvom uređaju. Ne šalje se na server.</li>
          <li><strong>Session kolačić za administratore</strong> — postavlja se samo administratorima nakon prijave u admin sučelje.</li>
        </ul>
        <p>
          Budući da ne koristimo analitičke ni marketinške kolačiće trećih strana, trenutno nije
          potreban cookie banner. Ako se to promijeni (npr. uvođenjem vanjske analitike), ova
          stranica i mehanizam privole bit će ažurirani.
        </p>
      </div>
    </div>
  );
}
