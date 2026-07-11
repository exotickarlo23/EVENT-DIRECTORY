import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Pravila korištenja",
  alternates: { canonical: absoluteUrl("/pravila-koristenja") },
};

export default function PravilaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Pravila korištenja" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-4xl">Pravila korištenja</h1>
      <div className="prose-festko mt-6 text-ink">
        <p>
          Ova pravila uređuju korištenje platforme {siteConfig.name}. Korištenjem stranice
          prihvaćaš navedena pravila. <strong>Napomena:</strong> ovo je radni predložak pravila za
          MVP fazu — prije javnog lansiranja tekst treba pregledati pravni stručnjak.
        </p>
        <h2>Uloga platforme</h2>
        <p>
          {siteConfig.name} je katalog i tražilica event-usluga. Platforma povezuje korisnike s
          ponuđačima, ali nije ugovorna strana u poslovima između korisnika i ponuđača. Dogovor o
          terminu, cijeni, plaćanju i izvedbi sklapa se izravno s ponuđačem.
        </p>
        <h2>Točnost podataka</h2>
        <p>
          Podatke o ponuđačima prikupljamo iz javno dostupnih izvora i od samih ponuđača te ih
          nastojimo održavati točnima, ali ne jamčimo potpunost ili ažurnost. Profili označeni kao
          „Profil nije preuzet” nisu potvrđeni od strane ponuđača.
        </p>
        <h2>Obveze korisnika</h2>
        <p>
          Obrasce na stranici smiješ koristiti samo za stvarne upite. Zabranjeno je slanje spama,
          lažnih zahtjeva za preuzimanje profila i objavljivanje neistinitih recenzija.
        </p>
        <h2>Istaknuti oglasi</h2>
        <p>
          Ponuđači mogu platiti istaknutu poziciju. Takvi oglasi uvijek su označeni značkom
          „Istaknuto”.
        </p>
        <h2>Kontakt</h2>
        <p>
          Za pitanja o pravilima piši na {siteConfig.contact.email}.
        </p>
      </div>
    </div>
  );
}
