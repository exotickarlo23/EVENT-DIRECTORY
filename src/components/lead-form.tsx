"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitLead, type FormResult } from "@/lib/actions/public";
import { Input, Textarea, Label, FieldError, Button, Select } from "@/components/ui";

const EVENT_TYPES = [
  "Dječji rođendan",
  "Rođendan za odrasle",
  "Vjenčanje",
  "Krštenje / pričest / krizma",
  "Poslovni event",
  "Privatna zabava",
  "Drugo",
];

export function LeadForm({
  listingId,
  listingName,
  defaultMessage,
  compact = false,
}: {
  listingId?: number;
  listingName?: string;
  defaultMessage?: string;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormResult | null, FormData>(submitLead, null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state?.ok) successRef.current?.focus();
  }, [state?.ok]);

  if (state?.ok) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-card border border-teal/30 bg-teal/5 p-6 text-center"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-teal" aria-hidden="true" />
        <h3 className="mt-3 font-display text-xl font-semibold text-plum">Upit je poslan!</h3>
        <p className="mt-1 text-sm text-muted">
          {listingName ? `${listingName} će ti se javiti izravno na e-mail ili telefon.` : "Javit ćemo ti se u najkraćem roku."}
        </p>
      </div>
    );
  }

  const err = state?.fieldErrors ?? {};

  return (
    <form action={formAction} noValidate className="space-y-4">
      {listingId ? <input type="hidden" name="listingId" value={listingId} /> : null}
      {/* Honeypot protiv spama — skriveno od korisnika */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="lf-website-hp">Ne popunjavaj ovo polje</label>
        <input id="lf-website-hp" type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral-dark">
          {state.error}
        </p>
      ) : null}

      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <div>
          <Label htmlFor="lf-name">Ime i prezime *</Label>
          <Input id="lf-name" name="name" required autoComplete="name" aria-invalid={!!err.name} aria-describedby={err.name ? "lf-name-err" : undefined} />
          <FieldError id="lf-name-err" error={err.name} />
        </div>
        <div>
          <Label htmlFor="lf-email">E-mail *</Label>
          <Input id="lf-email" name="email" type="email" required autoComplete="email" aria-invalid={!!err.email} aria-describedby={err.email ? "lf-email-err" : undefined} />
          <FieldError id="lf-email-err" error={err.email} />
        </div>
        <div>
          <Label htmlFor="lf-phone">Telefon</Label>
          <Input id="lf-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div>
          <Label htmlFor="lf-date">Datum događaja</Label>
          <Input id="lf-date" name="eventDate" type="date" />
        </div>
        <div>
          <Label htmlFor="lf-location">Lokacija događaja</Label>
          <Input id="lf-location" name="eventLocation" placeholder="npr. Zagreb" />
        </div>
        <div>
          <Label htmlFor="lf-type">Vrsta događaja</Label>
          <Select id="lf-type" name="eventType" defaultValue="">
            <option value="">Odaberi…</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="lf-message">Poruka *</Label>
        <Textarea
          id="lf-message"
          name="message"
          required
          defaultValue={defaultMessage}
          aria-invalid={!!err.message}
          aria-describedby={err.message ? "lf-message-err" : undefined}
        />
        <FieldError id="lf-message-err" error={err.message} />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-2 text-sm text-muted">
          <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-coral" aria-describedby={err.consent ? "lf-consent-err" : undefined} />
          <span>
            Slažem se da se moji podaci koriste za odgovor na ovaj upit, u skladu s{" "}
            <a href="/politika-privatnosti" className="underline hover:text-plum" target="_blank">
              politikom privatnosti
            </a>
            . *
          </span>
        </label>
        <FieldError id="lf-consent-err" error={err.consent} />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        <Send className="h-4 w-4" aria-hidden="true" />
        {pending ? "Slanje…" : "Pošalji upit"}
      </Button>
    </form>
  );
}
