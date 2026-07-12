import { Sparkles, Video, Instagram, Star } from "lucide-react";
import { ButtonLink } from "@/components/ui";

/**
 * Full-bleed (preko cijele širine ekrana) sekcija za founding partnere.
 * Probija se iz max-width containera tehnikom left-1/2 / -mx-[50vw].
 */
export function FoundingPartnersBand() {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] my-14 w-screen max-w-[100vw] overflow-hidden bg-plum py-14 text-white md:py-16">
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="absolute -left-10 top-6 h-40 w-40 rounded-full bg-gold blur-3xl" />
        <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-coral blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-1.5 text-sm font-bold text-plum">
          <Star className="h-4 w-4" aria-hidden="true" />
          Founding partneri
        </span>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-2xl font-bold md:text-4xl">
          Posebni uvjeti za prve partnere
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/80">
          Platforma je u ranoj fazi i prvim partnerima nudimo posebne uvjete za istaknute profile.
          Uz to, <strong className="text-white">prve partnere posebno predstavljamo na našim
          društvenim mrežama</strong> — snimimo i objavimo <strong className="text-white">reel o
          vašem poslovanju</strong> koji radi naš tim.
        </p>

        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3">
          <FoundingPerk icon={Video} title="Reel s naše strane" text="Snimamo i montiramo kratki reel o tvom poslovanju — bez tvog troška." />
          <FoundingPerk icon={Instagram} title="Objava na mrežama" text="Reel objavljujemo na slavimo.hr profilima i predstavljamo te našoj publici." />
          <FoundingPerk icon={Sparkles} title="Povlašteni uvjeti" text="Prvi partneri dobivaju najbolje uvjete za istaknuti profil." />
        </div>

        <div className="mt-8">
          <ButtonLink href="/kontakt" size="lg">
            Prijavi se kao founding partner
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

function FoundingPerk({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Video;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-card bg-white/5 p-5 text-left ring-1 ring-white/10">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-3 font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm text-white/70">{text}</p>
    </div>
  );
}
