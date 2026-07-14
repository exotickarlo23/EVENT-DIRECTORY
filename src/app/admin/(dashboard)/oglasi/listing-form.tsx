"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveListing, type ListingSaveResult } from "@/lib/actions/admin";
import { Input, Textarea, Label, FieldError, Button, Select } from "@/components/ui";
import { slugify } from "@/lib/utils";
import {
  LISTING_STATUSES,
  LISTING_TIERS,
  CLAIM_STATUSES,
  PRICE_MODELS,
  type Listing,
} from "@/lib/db/schema";

interface Taxonomy {
  id: number;
  name: string;
  parentId?: number | null;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Na pregledu",
  published: "Objavljeno",
  paused: "Pauzirano",
  archived: "Arhivirano",
};
const PRICE_MODEL_LABELS: Record<string, string> = {
  from: "Od (početna cijena)",
  range: "Raspon (od–do)",
  fixed: "Fiksna cijena",
  on_request: "Cijena na upit",
};
const CLAIM_LABELS: Record<string, string> = {
  unclaimed: "Nije preuzet",
  claim_pending: "Zahtjev u obradi",
  claimed: "Preuzet",
};

export function ListingForm({
  listing,
  categories,
  locations,
  occasions,
  selected,
  galleryUrls,
}: {
  listing: Listing | null;
  categories: Taxonomy[];
  locations: Taxonomy[];
  occasions: Taxonomy[];
  selected?: { categoryIds: number[]; occasionIds: number[]; serviceAreaIds: number[] };
  galleryUrls?: string[];
}) {
  const action = saveListing.bind(null, listing?.id ?? null);
  const [state, formAction, pending] = useActionState<ListingSaveResult | null, FormData>(
    action,
    null
  );
  const [name, setName] = useState(listing?.name ?? "");
  const [slug, setSlug] = useState(listing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(listing));

  const err = state?.fieldErrors ?? {};
  const topCategories = categories.filter((c) => c.parentId == null);

  return (
    <form action={formAction} className="max-w-4xl space-y-8">
      {state?.error ? (
        <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral-dark">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="rounded-xl bg-teal/10 px-4 py-3 text-sm font-semibold text-teal">
          Oglas je spremljen.{" "}
          {!listing && state.listingId ? (
            <Link href={`/admin/oglasi/${state.listingId}`} className="underline">
              Otvori za daljnje uređivanje →
            </Link>
          ) : null}
        </p>
      ) : null}
      {state?.duplicates && state.duplicates.length > 0 ? (
        <div className="rounded-xl bg-gold/20 px-4 py-3 text-sm text-plum">
          <p className="font-bold">Mogući duplikati — provjeri prije objave:</p>
          <ul className="mt-1 list-inside list-disc">
            {state.duplicates.map((d) => (
              <li key={`${d.id}-${d.reason}`}>
                <Link href={`/admin/oglasi/${d.id}`} className="underline">
                  {d.name}
                </Link>{" "}
                ({d.reason})
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Fieldset legend="Osnovni podaci">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="f-name">Naziv oglasa *</Label>
            <Input
              id="f-name"
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              aria-invalid={!!err.name}
            />
            <FieldError error={err.name} />
          </div>
          <div>
            <Label htmlFor="f-slug">Slug (URL) *</Label>
            <Input
              id="f-slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              aria-invalid={!!err.slug}
            />
            <FieldError error={err.slug} />
          </div>
          <div>
            <Label htmlFor="f-business">Pravni naziv poslovanja</Label>
            <Input id="f-business" name="businessName" defaultValue={listing?.businessName ?? ""} />
          </div>
          <div>
            <Label htmlFor="f-status">Status *</Label>
            <Select id="f-status" name="status" defaultValue={listing?.status ?? "draft"}>
              {LISTING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="f-claim">Claim status</Label>
            <Select id="f-claim" name="claimStatus" defaultValue={listing?.claimStatus ?? "unclaimed"}>
              {CLAIM_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {CLAIM_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="f-short">Kratki opis (kartica, max 300)</Label>
          <Textarea id="f-short" name="shortDescription" className="min-h-20" maxLength={300} defaultValue={listing?.shortDescription ?? ""} />
        </div>
        <div>
          <Label htmlFor="f-desc">Puni opis</Label>
          <Textarea id="f-desc" name="description" className="min-h-40" defaultValue={listing?.description ?? ""} />
        </div>
      </Fieldset>

      <Fieldset legend="Kategorije i prigode">
        <div>
          <Label htmlFor="f-primarycat">Primarna kategorija</Label>
          <Select id="f-primarycat" name="primaryCategoryId" defaultValue={listing?.primaryCategoryId ?? ""}>
            <option value="">— odaberi —</option>
            {topCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <CheckboxGroup
          legend="Sve kategorije i podkategorije"
          name="categoryIds"
          items={categories.map((c) => ({
            id: c.id,
            label: c.parentId ? `— ${c.name}` : c.name,
          }))}
          defaultChecked={selected?.categoryIds ?? []}
        />
        <CheckboxGroup
          legend="Prigode"
          name="occasionIds"
          items={occasions.map((o) => ({ id: o.id, label: o.name }))}
          defaultChecked={selected?.occasionIds ?? []}
        />
      </Fieldset>

      <Fieldset legend="Lokacija i područje usluge">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="f-baseloc">Sjedište (grad)</Label>
            <Select id="f-baseloc" name="baseLocationId" defaultValue={listing?.baseLocationId ?? ""}>
              <option value="">— odaberi —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="f-address">Adresa</Label>
            <Input id="f-address" name="address" defaultValue={listing?.address ?? ""} />
          </div>
        </div>
        <CheckboxGroup
          legend="Dodatna područja pružanja usluge"
          name="serviceAreaIds"
          items={locations.map((l) => ({ id: l.id, label: l.name }))}
          defaultChecked={selected?.serviceAreaIds ?? []}
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-plum">
          <input
            type="checkbox"
            name="servesAtClientLocation"
            defaultChecked={listing?.servesAtClientLocation ?? false}
            className="h-4 w-4 accent-coral"
          />
          Dolazak na adresu klijenta
        </label>
      </Fieldset>

      <Fieldset legend="Cijena">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="f-pricemodel">Model cijene</Label>
            <Select id="f-pricemodel" name="priceModel" defaultValue={listing?.priceModel ?? "on_request"}>
              {PRICE_MODELS.map((m) => (
                <option key={m} value={m}>
                  {PRICE_MODEL_LABELS[m]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="f-pricefrom">Cijena od (€)</Label>
            <Input id="f-pricefrom" name="priceFrom" type="number" min={0} step="0.01" defaultValue={listing?.priceFrom ?? ""} />
          </div>
          <div>
            <Label htmlFor="f-priceto">Cijena do (€)</Label>
            <Input id="f-priceto" name="priceTo" type="number" min={0} step="0.01" defaultValue={listing?.priceTo ?? ""} />
          </div>
        </div>
      </Fieldset>

      <Fieldset legend="Kontakt">
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["phone", "Telefon"],
              ["whatsapp", "WhatsApp"],
              ["email", "E-mail"],
              ["website", "Web stranica"],
              ["instagram", "Instagram"],
              ["facebook", "Facebook"],
            ] as const
          ).map(([field, label]) => (
            <div key={field}>
              <Label htmlFor={`f-${field}`}>{label}</Label>
              <Input id={`f-${field}`} name={field} defaultValue={(listing?.[field] as string | null) ?? ""} />
            </div>
          ))}
        </div>
      </Fieldset>

      <Fieldset legend="Mediji">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="f-cover">Naslovna fotografija (URL)</Label>
            <Input id="f-cover" name="coverImage" defaultValue={listing?.coverImage ?? ""} placeholder="/images/... ili https://…" />
            <p className="mt-1 text-xs text-muted">Prazno = brendirani placeholder.</p>
          </div>
          <div>
            <Label htmlFor="f-video">Video URL</Label>
            <Input id="f-video" name="videoUrl" defaultValue={listing?.videoUrl ?? ""} />
          </div>
        </div>
        <div>
          <Label htmlFor="f-gallery">Galerija fotografija (jedan URL po retku)</Label>
          <Textarea
            id="f-gallery"
            name="galleryUrls"
            className="min-h-28 font-mono text-xs"
            defaultValue={(galleryUrls ?? []).join("\n")}
            placeholder={"https://primjer.hr/foto-1.jpg\nhttps://primjer.hr/foto-2.jpg"}
          />
          <p className="mt-1 text-xs text-muted">
            Ovdje slažeš dodatne fotografije (uz naslovnu). Uredi, dodaj ili obriši retke —
            spremljena lista zamjenjuje prethodnu galeriju.
          </p>
        </div>
      </Fieldset>

      <Fieldset legend="Istaknuti status">
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="f-tier">Tier</Label>
            <Select id="f-tier" name="tier" defaultValue={listing?.tier ?? "free"}>
              {LISTING_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t === "free" ? "Besplatni" : "Istaknuti"}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="f-weight">Težina isticanja (0–100)</Label>
            <Input id="f-weight" name="featuredWeight" type="number" min={0} max={100} defaultValue={listing?.featuredWeight ?? 0} />
          </div>
          <div>
            <Label htmlFor="f-ffrom">Istaknuto od</Label>
            <Input id="f-ffrom" name="featuredFrom" type="date" defaultValue={listing?.featuredFrom?.slice(0, 10) ?? ""} />
          </div>
          <div>
            <Label htmlFor="f-funtil">Istaknuto do</Label>
            <Input id="f-funtil" name="featuredUntil" type="date" defaultValue={listing?.featuredUntil?.slice(0, 10) ?? ""} />
          </div>
        </div>
      </Fieldset>

      <Fieldset legend="SEO i interno">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="f-seotitle">SEO title</Label>
            <Input id="f-seotitle" name="seoTitle" defaultValue={listing?.seoTitle ?? ""} />
          </div>
          <div>
            <Label htmlFor="f-seodesc">SEO description</Label>
            <Input id="f-seodesc" name="seoDescription" defaultValue={listing?.seoDescription ?? ""} />
          </div>
          <div>
            <Label htmlFor="f-canonical">Canonical override (samo ako je nužno)</Label>
            <Input id="f-canonical" name="canonicalOverride" defaultValue={listing?.canonicalOverride ?? ""} />
          </div>
          <div>
            <Label htmlFor="f-source">Izvor podataka</Label>
            <Input id="f-source" name="dataSource" defaultValue={listing?.dataSource ?? ""} />
          </div>
        </div>
        <div>
          <Label htmlFor="f-note">Interna napomena</Label>
          <Textarea id="f-note" name="internalNote" className="min-h-20" defaultValue={listing?.internalNote ?? ""} />
        </div>
      </Fieldset>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Spremanje…" : listing ? "Spremi promjene" : "Kreiraj oglas"}
        </Button>
        <Link
          href="/admin/oglasi"
          className="inline-flex min-h-11 items-center rounded-full px-6 py-2.5 text-sm font-semibold text-muted hover:text-plum"
        >
          Natrag na popis
        </Link>
      </div>
    </form>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-card border border-line bg-white p-6 shadow-card">
      <legend className="px-2 font-display text-lg font-semibold text-plum">{legend}</legend>
      {children}
    </fieldset>
  );
}

function CheckboxGroup({
  legend,
  name,
  items,
  defaultChecked,
}: {
  legend: string;
  name: string;
  items: { id: number; label: string }[];
  defaultChecked: number[];
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-plum">{legend}</legend>
      <div className="grid max-h-52 grid-cols-2 gap-1 overflow-y-auto rounded-xl border border-line p-3 sm:grid-cols-3">
        {items.map((item) => (
          <label key={item.id} className="flex cursor-pointer items-center gap-2 py-1 text-sm text-ink">
            <input
              type="checkbox"
              name={name}
              value={item.id}
              defaultChecked={defaultChecked.includes(item.id)}
              className="h-4 w-4 shrink-0 accent-coral"
            />
            {item.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
