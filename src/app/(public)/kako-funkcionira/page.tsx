import type { Metadata } from "next";
import { Search, Layers, MessagesSquare } from "lucide-react";
import { absoluteUrl } from "@/config/site";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { Faq } from "@/components/faq";

export const metadata: Metadata = {
  title: "Kako funkcionira Feštko",
  description:
    "Od ideje do upita u tri koraka: odaberi uslugu i lokaciju, usporedi ponuđače i pošalji izravan upit — besplatno.",
  alternates: { canonical: absoluteUrl("/kako-funkcionira") },
};

export default function KakoFunkcioniraPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Kako funkcionira" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-5xl">
        Od ideje do upita u tri jednostavna koraka
      </h1>
      <p className="mt-3 text-lg text-muted">
        Feštko je katalog event-usluga — spaja ljude koji planiraju događaj s ponuđačima koji ga
        znaju izvesti. Korištenje je za korisnike potpuno besplatno.
      </p>

      <div className="mt-10 space-y-6">
        {[
          {
            icon: Search,
            title: "1. Reci nam što tražiš",
            text: "Odaberi uslugu, prigodu i lokaciju. Pretraga radi po kategorijama, podkategorijama i nazivima ponuđača, a rezultate možeš filtrirati po cijeni i dostupnosti dolaska na adresu.",
          },
          {
            icon: Layers,
            title: "2. Usporedi ponuđače",
            text: "Pregledaj fotografije, cijene, područje rada i iskustva drugih korisnika. Spremaj favorite i dodaj do četiri oglasa u usporedbu — bez registracije.",
          },
          {
            icon: MessagesSquare,
            title: "3. Pošalji izravan upit",
            text: "Kontaktiraj odabrane ponuđače bez nepotrebnih posrednika — obrascem, telefonom ili WhatsAppom. Dogovor, termin i plaćanje ideš izravno s ponuđačem.",
          },
        ].map((s) => (
          <div key={s.title} className="flex gap-5 rounded-card border border-line bg-white p-6 shadow-card">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal/10 text-teal">
              <s.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-plum">{s.title}</h2>
              <p className="mt-2 text-muted">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <SectionHeading title="Za ponuđače" />
        <p className="text-muted">
          Pružaš event-usluge? Osnovni profil je besplatan, a istaknuti profil donosi prioritetnu
          poziciju i dodatnu promociju. Ako tvoj profil već postoji u katalogu, možeš ga preuzeti i
          ažurirati podatke.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/dodaj-poslovanje">Dodaj poslovanje</ButtonLink>
          <ButtonLink href="/cjenik" variant="outline">
            Pogledaj pakete
          </ButtonLink>
        </div>
      </section>

      <Faq
        items={[
          { q: "Koliko košta korištenje Feštka?", a: "Za korisnike koji traže usluge — ništa. Pretraga, favoriti, usporedba i slanje upita su besplatni." },
          { q: "Rezervira li Feštko termin umjesto mene?", a: "Ne — Feštko te povezuje s ponuđačem, a dogovor o terminu, cijeni i plaćanju radiš izravno s njim." },
          { q: "Kako znam je li ponuđač pouzdan?", a: "Pogledaj potpunost profila, fotografije i recenzije drugih korisnika. Preporučujemo poslati upit većem broju ponuđača i usporediti ponude." },
        ]}
      />
    </div>
  );
}
