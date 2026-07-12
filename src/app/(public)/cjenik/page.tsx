import type { Metadata } from "next";
import { Check } from "lucide-react";
import { absoluteUrl } from "@/config/site";
import { getActivePricingPlans } from "@/lib/queries";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ButtonLink, Badge } from "@/components/ui";
import { FoundingPartnersBand } from "@/components/founding-partners";
import { Faq } from "@/components/faq";
import { formatEur, cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cjenik — paketi za ponuđače",
  description:
    "Besplatan osnovni profil i istaknuti profil za maksimalnu vidljivost. Pogledaj što uključuje svaki paket.",
  alternates: { canonical: absoluteUrl("/cjenik") },
};

export default async function CjenikPage() {
  const plans = await getActivePricingPlans();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Cjenik" }]} />
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-bold text-plum md:text-5xl">Paketi za ponuđače</h1>
        <p className="mt-3 text-lg text-muted">
          Kreni besplatno, nadogradi kad želiš veću vidljivost. Bez skrivenih troškova.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        {plans.map((plan) => {
          const features: string[] = (() => {
            try {
              return JSON.parse(plan.featuresJson ?? "[]") as string[];
            } catch {
              return [];
            }
          })();
          return (
            <div
              key={plan.slug}
              className={cn(
                "relative flex flex-col rounded-card border bg-white p-8 shadow-card",
                plan.highlighted ? "border-2 border-coral shadow-card-hover" : "border-line"
              )}
            >
              {plan.highlighted ? (
                <Badge variant="featured" className="absolute -top-3 left-8">
                  Najveća vidljivost
                </Badge>
              ) : null}
              <h2 className="font-display text-2xl font-semibold text-plum">{plan.name}</h2>
              <p className="mt-2 text-sm text-muted">{plan.description}</p>
              <p className="mt-4">
                {plan.price === 0 ? (
                  <span className="font-display text-4xl font-bold text-plum">Besplatno</span>
                ) : plan.price != null ? (
                  <>
                    <span className="font-display text-4xl font-bold text-plum">{formatEur(plan.price)}</span>
                    <span className="text-muted"> / {plan.period}</span>
                  </>
                ) : (
                  <span className="font-display text-2xl font-bold text-plum">Po dogovoru</span>
                )}
              </p>
              {plan.price != null && plan.price > 0 && plan.period.startsWith("god") ? (
                <p className="mt-1 text-sm font-semibold text-teal">
                  To je samo {formatEur(Math.round((plan.price / 12) * 100) / 100)} mjesečno.
                </p>
              ) : null}
              <ul className="mt-6 flex-1 space-y-2.5">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <ButtonLink
                  href={plan.highlighted ? "/kontakt" : "/dodaj-poslovanje"}
                  variant={plan.highlighted ? "primary" : "outline"}
                  className="w-full"
                >
                  {plan.ctaLabel}
                </ButtonLink>
              </div>
            </div>
          );
        })}
      </div>

      <FoundingPartnersBand />

      <div className="mx-auto max-w-2xl">
        <Faq
          items={[
            { q: "Mogu li kasnije prijeći s besplatnog na istaknuti profil?", a: "Da, u bilo kojem trenutku — postojeći profil se samo nadogradi, ništa se ne gubi." },
            { q: "Kako se plaća istaknuti profil?", a: "U ovoj fazi naplata se dogovara izravno (ponuda i račun). Online plaćanje i pretplate stižu kasnije." },
            { q: "Postoji li ugovorna obveza?", a: "Ne — istaknuti status vrijedi za dogovoreno razdoblje i produžuje se dogovorom." },
          ]}
        />
      </div>
    </div>
  );
}
