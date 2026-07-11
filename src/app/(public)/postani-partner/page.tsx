import type { Metadata } from "next";
import { Eye, Target, TrendingUp, Palette, Search, Sparkles, HeadphonesIcon } from "lucide-react";
import { absoluteUrl } from "@/config/site";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { Faq } from "@/components/faq";

export const metadata: Metadata = {
  title: "Postani partner — predstavi svoje event-poslovanje",
  description:
    "Predstavi svoje poslovanje ljudima koji organiziraju rođendane, vjenčanja, privatne proslave i poslovne događaje. Besplatan osnovni profil.",
  alternates: { canonical: absoluteUrl("/postani-partner") },
};

const VALUES = [
  { icon: Eye, title: "Vidljivost gdje se traži", text: "Tvoj profil pojavljuje se u tvojoj kategoriji i lokaciji — točno tamo gdje korisnici traže uslugu poput tvoje." },
  { icon: Target, title: "Ciljani upiti", text: "Upite šalju ljudi koji već planiraju događaj — s datumom, lokacijom i vrstom proslave." },
  { icon: Search, title: "SEO prisutnost", text: "Feštko stranice optimizirane su za pretrage poput „napuhanci Zagreb” — tvoja ponuda dio je tih rezultata." },
  { icon: Palette, title: "Kvalitetan profil", text: "Fotografije, cijene, paketi i područje rada — predstavljeni pregledno i profesionalno." },
  { icon: Sparkles, title: "Istaknuta promocija", text: "Uz istaknuti profil dobivaš prioritetnu poziciju, veću galeriju i pojavljivanje na naslovnici." },
  { icon: HeadphonesIcon, title: "Podrška oko sadržaja", text: "Pomažemo ti posložiti opis, ponudu i prezentaciju da profil ostavi najbolji dojam." },
];

export default function PostaniPartnerPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Postani partner" }]} />
      <div className="max-w-3xl">
        <h1 className="font-display text-3xl font-bold leading-tight text-plum md:text-5xl">
          Tvoja usluga zaslužuje publiku koja je upravo traži.
        </h1>
        <p className="mt-4 text-lg text-muted">
          Predstavi svoje poslovanje ljudima koji organiziraju rođendane, vjenčanja, privatne
          proslave i poslovne događaje.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/dodaj-poslovanje" size="lg">
            Dodaj svoje poslovanje
          </ButtonLink>
          <ButtonLink href="/cjenik" size="lg" variant="outline">
            Pogledaj pakete
          </ButtonLink>
        </div>
      </div>

      <section className="mt-16">
        <SectionHeading title="Što dobivaš kao partner" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-card border border-line bg-white p-6 shadow-card">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
                <v.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-bold text-plum">{v.title}</h3>
              <p className="mt-2 text-sm text-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading title="Kako počinješ" subtitle="Bez kompliciranog postavljanja — mi radimo veći dio posla." />
        <ol className="grid gap-5 md:grid-cols-4">
          {[
            { step: 1, title: "Pošalji podatke", text: "Ispuni kratki obrazac s osnovnim informacijama o poslovanju." },
            { step: 2, title: "Mi pripremamo profil", text: "Posložimo ili ažuriramo tvoj profil — opis, kategorije i područje rada." },
            { step: 3, title: "Ponuda postaje vidljiva", text: "Tvoj profil pojavljuje se u pretragama tvoje kategorije i grada." },
            { step: 4, title: "Primaš izravne upite", text: "Korisnici te kontaktiraju izravno — telefonom, e-mailom ili WhatsAppom." },
          ].map((s) => (
            <li key={s.step} className="relative rounded-card border border-line bg-white p-6 shadow-card">
              <span className="absolute -top-4 left-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-coral font-display text-sm font-bold text-white">
                {s.step}
              </span>
              <h3 className="mt-2 font-bold text-plum">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 rounded-card border-2 border-gold bg-gold/10 p-8 text-center md:p-10">
        <TrendingUp className="mx-auto h-8 w-8 text-plum" aria-hidden="true" />
        <h2 className="mt-3 font-display text-2xl font-bold text-plum md:text-3xl">
          Posebni uvjeti za prve partnere
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-muted">
          Platforma je u ranoj fazi i prvim partnerima nudimo posebne uvjete za istaknute profile.
          Javi se i dogovorit ćemo detalje.
        </p>
        <div className="mt-6">
          <ButtonLink href="/kontakt" variant="secondary" size="lg">
            Kontaktiraj nas
          </ButtonLink>
        </div>
      </section>

      <Faq
        items={[
          { q: "Koliko košta osnovni profil?", a: "Osnovni profil je besplatan — uključuje naziv, opis, fotografiju, kategoriju, lokaciju i kontakt." },
          { q: "Što dobivam s istaknutim profilom?", a: "Prioritetnu poziciju u rezultatima, značku „Istaknuto”, veću galeriju, pakete s cijenama, izravne CTA gumbe i mjesečnu statistiku." },
          { q: "Mogu li preuzeti postojeći profil svog poslovanja?", a: "Da — na profilu klikni „Preuzmi ovaj profil” i pošalji zahtjev. Nakon provjere povezujemo profil s tobom." },
        ]}
      />
    </div>
  );
}
