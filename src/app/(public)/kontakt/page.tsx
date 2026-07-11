import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { absoluteUrl, siteConfig } from "@/config/site";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LeadForm } from "@/components/lead-form";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Javi nam se s pitanjem, prijedlogom ili upitom — odgovaramo u najkraćem roku.",
  alternates: { canonical: absoluteUrl("/kontakt") },
};

export default function KontaktPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Kontakt" }]} />
      <h1 className="font-display text-3xl font-bold text-plum md:text-4xl">Kontaktiraj nas</h1>
      <p className="mt-3 text-muted">
        Imaš pitanje, prijedlog ili trebaš pomoć u pronalasku usluge? Piši nam — odgovaramo u
        najkraćem roku.
      </p>
      <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-plum">
        <a href={`mailto:${siteConfig.contact.email}`} className="inline-flex items-center gap-2 hover:text-coral">
          <Mail className="h-4 w-4" aria-hidden="true" />
          {siteConfig.contact.email}
        </a>
        <span className="inline-flex items-center gap-2">
          <Phone className="h-4 w-4" aria-hidden="true" />
          {siteConfig.contact.phone}
        </span>
      </div>
      <div className="mt-8 rounded-card border border-line bg-white p-6 shadow-card md:p-8">
        <LeadForm />
      </div>
    </div>
  );
}
