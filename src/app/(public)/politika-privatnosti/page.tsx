import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Politika privatnosti",
  alternates: { canonical: absoluteUrl("/politika-privatnosti") },
};

export default function PrivatnostPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Politika privatnosti" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-4xl">Politika privatnosti</h1>
      <div className="prose-festko mt-6 text-ink">
        <p>
          <strong>Napomena:</strong> ovo je radni predložak za MVP fazu — prije javnog lansiranja
          tekst treba uskladiti s GDPR-om uz pomoć pravnog stručnjaka.
        </p>
        <h2>Koje podatke prikupljamo</h2>
        <ul>
          <li>Podatke koje sam/a uneseš u obrasce (ime, e-mail, telefon, poruka) — koristimo ih isključivo za obradu tvog upita ili zahtjeva.</li>
          <li>Osnovne anonimne metrike korištenja (npr. broj pregleda oglasa) — bez profiliranja.</li>
          <li>Favoriti i usporedba spremaju se lokalno u tvom pregledniku (localStorage) i ne šalju se na server.</li>
        </ul>
        <h2>Kome prosljeđujemo podatke</h2>
        <p>
          Sadržaj upita prosljeđujemo ponuđaču kojem je upit upućen kako bi ti mogao odgovoriti.
          Podatke ne prodajemo trećim stranama.
        </p>
        <h2>Koliko dugo čuvamo podatke</h2>
        <p>
          Upite i zahtjeve čuvamo dok su potrebni za obradu, a najduže godinu dana, osim ako
          zakon nalaže drukčije.
        </p>
        <h2>Tvoja prava</h2>
        <p>
          Imaš pravo na uvid, ispravak i brisanje svojih podataka. Zahtjev pošalji na{" "}
          {siteConfig.contact.email}.
        </p>
      </div>
    </div>
  );
}
