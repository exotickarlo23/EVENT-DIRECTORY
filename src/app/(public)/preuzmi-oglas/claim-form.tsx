"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitClaim, type FormResult, trackEvent } from "@/lib/actions/public";
import { Input, Textarea, Label, FieldError, Button, Select } from "@/components/ui";

const PROOF_METHODS = [
  "Poslovni e-mail s domene web stranice",
  "Poziv na službeni broj telefona",
  "Poruka sa službenog Instagram/Facebook profila",
  "Izvadak iz obrta/sudskog registra",
  "Drugo (opiši u poruci)",
];

export function ClaimForm({ listingId, listingName }: { listingId: number; listingName: string }) {
  const [state, formAction, pending] = useActionState<FormResult | null, FormData>(submitClaim, null);
  const started = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.ok) successRef.current?.focus();
  }, [state?.ok]);

  if (state?.ok) {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className="p-4 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-teal" aria-hidden="true" />
        <h2 className="mt-3 font-display text-xl font-semibold text-plum">Zahtjev je poslan!</h2>
        <p className="mt-1 text-sm text-muted">
          Provjerit ćemo podatke i javiti se na navedeni e-mail. Provjera obično traje 1–2 radna
          dana.
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
          void trackEvent("claim_started", listingId);
        }
      }}
      className="space-y-4"
    >
      <input type="hidden" name="listingId" value={listingId} />
      <div className="hidden" aria-hidden="true">
        <label htmlFor="cf-hp">Ne popunjavaj</label>
        <input id="cf-hp" type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral-dark">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cf-name">Ime i prezime *</Label>
          <Input id="cf-name" name="fullName" required autoComplete="name" aria-invalid={!!err.fullName} />
          <FieldError error={err.fullName} />
        </div>
        <div>
          <Label htmlFor="cf-email">Poslovni e-mail *</Label>
          <Input id="cf-email" name="email" type="email" required autoComplete="email" aria-invalid={!!err.email} />
          <FieldError error={err.email} />
        </div>
        <div>
          <Label htmlFor="cf-phone">Telefon</Label>
          <Input id="cf-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div>
          <Label htmlFor="cf-role">Funkcija u poslovanju</Label>
          <Input id="cf-role" name="role" placeholder="npr. vlasnik, voditeljica…" />
        </div>
      </div>
      <div>
        <Label htmlFor="cf-web">Web ili društvena mreža poslovanja</Label>
        <Input id="cf-web" name="website" placeholder="https://… ili @instagram" />
      </div>
      <div>
        <Label htmlFor="cf-proof">Kako možemo potvrditi da je poslovanje tvoje?</Label>
        <Select id="cf-proof" name="proofMethod" defaultValue="">
          <option value="">Odaberi način…</option>
          {PROOF_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="cf-message">Dodatna poruka</Label>
        <Textarea
          id="cf-message"
          name="message"
          className="min-h-24"
          placeholder={`npr. Ja sam vlasnik poslovanja ${listingName}…`}
        />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-muted">
          <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-coral" />
          <span>
            Potvrđujem da sam ovlašten/a zastupati ovo poslovanje i prihvaćam{" "}
            <a href="/pravila-koristenja" className="underline hover:text-plum" target="_blank">
              pravila korištenja
            </a>
            . *
          </span>
        </label>
        <FieldError error={err.consent} />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? "Slanje…" : "Pošalji zahtjev za preuzimanje"}
      </Button>
    </form>
  );
}
