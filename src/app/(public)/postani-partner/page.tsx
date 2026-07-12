import type { Metadata } from "next";
import { Eye, Target, Instagram, Palette, Search, Sparkles, HeadphonesIcon } from "lucide-react";
import { absoluteUrl } from "@/config/site";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { FoundingPartnersBand } from "@/components/founding-partners";
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
  { icon: Search, title: "SEO prisutnost", text: "slavimo.hr stranice optimizirane su za pretrage poput „napuhanci Zagreb” — tvoja ponuda dio je tih rezultata." },
  { icon: Palette, title: "Kvalitetan profil", text: "Fotografije, cijene, paketi i područje rada — predstavljeni pregledno i profesionalno." },
  { icon: Sparkles, title: "Istaknuta promocija", text: "Uz istaknuti profil dobivaš prioritetnu poziciju, veću galeriju i pojavljivanje na naslovnici." },
  { icon: Instagram, title: "Objava na Instagramu", text: "Istaknuti profili dobivaju objavu (post) i story na našem Instagramu — dodatna publika bez tvog truda." },
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

      <FoundingPartnersBand />

      <Faq
        items={[
          {
            q: "Koliko košta osnovni profil?",
            a: "Osnovni profil je potpuno besplatan i uključuje naziv, opis, jednu fotografiju, kategoriju, lokaciju i osnovne kontakte te pojavljivanje u rezultatima pretrage. Nema skrivenih troškova ni provizije na upite.",
          },
          {
            q: "Što dobivam s istaknutim profilom?",
            a: "Istaknuti profil (60 € godišnje, oko 5 € mjesečno) donosi prioritetnu poziciju u rezultatima, značku „Istaknuto”, veću galeriju s videom, pakete s detaljnim cijenama, izravne CTA gumbe (telefon, WhatsApp, e-mail), pojavljivanje na naslovnici te objavu (post) i story na našem Instagramu.",
          },
          {
            q: "Što točno znači reel za founding partnere?",
            a: "Prvim partnerima naš tim snimi i montira kratki reel o njihovom poslovanju te ga objavi na slavimo.hr društvenim mrežama. To je dodatna promocija bez troška i truda s tvoje strane — dogovaramo termin snimanja i sadržaj zajedno.",
          },
          {
            q: "Kako i kada primam upite?",
            a: "Upite šalju korisnici izravno preko tvog profila — obrascem, telefonom ili WhatsAppom. Stižu ti na e-mail i/ili telefon koje si naveo, s opisom događaja (datum, lokacija, vrsta proslave). slavimo.hr ne uzima proviziju na dogovorene poslove.",
          },
          {
            q: "Trebam li tehničko znanje za postavljanje profila?",
            a: "Ne. Pošalješ nam osnovne podatke i materijale, a mi složimo ili ažuriramo profil i javimo se prije objave. Uređivanje profila samostalno kroz vlastiti dashboard dolazi u sljedećoj fazi platforme.",
          },
          {
            q: "Mogu li preuzeti postojeći profil svog poslovanja?",
            a: "Da — ako tvoje poslovanje već postoji u katalogu, na profilu klikni „Preuzmi ovaj profil” i pošalji zahtjev. Nakon ručne provjere povezujemo profil s tobom i ažuriramo podatke.",
          },
          {
            q: "Postoji li ugovorna obveza ili automatska naplata?",
            a: "Ne. Istaknuti status vrijedi za dogovoreno razdoblje i produžuje se isključivo dogovorom. U ovoj fazi naplata se dogovara izravno (ponuda i račun); online plaćanje i pretplate dolaze kasnije.",
          },
          {
            q: "Mogu li kasnije nadograditi ili ugasiti istaknuti profil?",
            a: "Možeš u bilo kojem trenutku prijeći s besplatnog na istaknuti profil (i obrnuto) — postojeći profil se samo nadograđuje ili vraća na osnovni, bez gubitka podataka.",
          },
        ]}
      />
    </div>
  );
}
