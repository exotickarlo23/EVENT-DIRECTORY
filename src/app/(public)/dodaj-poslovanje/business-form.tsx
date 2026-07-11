"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitBusiness, type FormResult, trackEvent } from "@/lib/actions/public";
import { Input, Textarea, Label, FieldError, Button, Select } from "@/components/ui";
import type { NavTaxonomyItem } from "@/components/header";

export function BusinessForm({
  categories,
  locations,
}: {
  categories: NavTaxonomyItem[];
  locations: NavTaxonomyItem[];
}) {
  const [state, formAction, pending] = useActionState<FormResult | null, FormData>(
    submitBusiness,
    null
  );
  const started = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.ok) successRef.current?.focus();
  }, [state?.ok]);

  if (state?.ok) {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="p-4 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-teal" aria-hidden="true" />
        <h2 className="mt-3 font-display text-xl font-semibold text-plum">Prijava je zaprimljena!</h2>
        <p className="mt-1 text-sm text-muted">
          Hvala! Pregledat ćemo podatke, pripremiti profil i javiti se prije objave.
        </p>
      </div>
    );
  }

  const err = state?.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      noValidate
      onFocus={() => {
        if (!started.current) {
          started.current = true;
          void trackEvent("business_submission_started");
        }
      }}
      className="space-y-4"
    >
      <div className="hidden" aria-hidden="true">
        <label htmlFor="bf-hp">Ne popunjavaj</label>
        <input id="bf-hp" type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral-dark">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bf-business">Naziv poslovanja *</Label>
          <Input id="bf-business" name="businessName" required aria-invalid={!!err.businessName} />
          <FieldError error={err.businessName} />
        </div>
        <div>
          <Label htmlFor="bf-contact">Ime kontakt osobe *</Label>
          <Input id="bf-contact" name="contactName" required autoComplete="name" aria-invalid={!!err.contactName} />
          <FieldError error={err.contactName} />
        </div>
        <div>
          <Label htmlFor="bf-email">E-mail *</Label>
          <Input id="bf-email" name="email" type="email" required autoComplete="email" aria-invalid={!!err.email} />
          <FieldError error={err.email} />
        </div>
        <div>
          <Label htmlFor="bf-phone">Telefon</Label>
          <Input id="bf-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div>
          <Label htmlFor="bf-web">Web stranica</Label>
          <Input id="bf-web" name="website" type="url" placeholder="https://…" />
        </div>
        <div>
          <Label htmlFor="bf-ig">Instagram</Label>
          <Input id="bf-ig" name="instagram" placeholder="@tvojprofil" />
        </div>
        <div>
          <Label htmlFor="bf-cat">Kategorija</Label>
          <Select id="bf-cat" name="categorySlug" defaultValue="">
            <option value="">Odaberi kategoriju…</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="bf-loc">Grad / sjedište</Label>
          <Select id="bf-loc" name="locationName" defaultValue="">
            <option value="">Odaberi grad…</option>
            {locations.map((l) => (
              <option key={l.slug} value={l.slug}>
                {l.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="bf-area">Područje pružanja usluge</Label>
        <Input id="bf-area" name="serviceArea" placeholder="npr. Zagreb i okolica do 50 km" />
      </div>
      <div>
        <Label htmlFor="bf-desc">Kratak opis ponude</Label>
        <Textarea id="bf-desc" name="description" placeholder="Što nudiš, za koje prigode, što te izdvaja…" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bf-price">Početna cijena</Label>
          <Input id="bf-price" name="priceFrom" placeholder="npr. od 120 €" />
        </div>
        <div>
          <Label htmlFor="bf-photos">Link na fotografije</Label>
          <Input id="bf-photos" name="photosUrl" placeholder="Google Drive, web, Instagram…" />
        </div>
      </div>
      <div>
        <Label htmlFor="bf-note">Napomena</Label>
        <Textarea id="bf-note" name="note" className="min-h-20" />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-muted">
          <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-coral" />
          <span>
            Slažem se da se moji podaci koriste za izradu profila i kontakt, u skladu s{" "}
            <a href="/politika-privatnosti" className="underline hover:text-plum" target="_blank">
              politikom privatnosti
            </a>
            . *
          </span>
        </label>
        <FieldError error={err.consent} />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Slanje…" : "Pošalji prijavu"}
      </Button>
    </form>
  );
}
