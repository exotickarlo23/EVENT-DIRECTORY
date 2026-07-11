"use client";

import { Phone, Mail, Globe, Instagram, Facebook, MessageCircle } from "lucide-react";
import { trackEvent } from "@/lib/actions/public";
import { normalizeWhatsapp, cn } from "@/lib/utils";

/** Kontaktni linkovi s first-party praćenjem klikova. */
export function ContactActions({
  listingId,
  phone,
  whatsapp,
  email,
  website,
  instagram,
  facebook,
  className,
}: {
  listingId: number;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  className?: string;
}) {
  const row =
    "flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-bold transition-colors";
  return (
    <div className={cn("space-y-2", className)}>
      {phone ? (
        <a
          href={`tel:${phone.replace(/\s/g, "")}`}
          onClick={() => void trackEvent("phone_clicked", listingId)}
          className={cn(row, "border-plum bg-plum text-white hover:bg-plum-soft")}
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {phone}
        </a>
      ) : null}
      {whatsapp ? (
        <a
          href={`https://wa.me/${normalizeWhatsapp(whatsapp)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => void trackEvent("whatsapp_clicked", listingId)}
          className={cn(row, "border-teal text-teal hover:bg-teal hover:text-white")}
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          WhatsApp
        </a>
      ) : null}
      {email ? (
        <a
          href={`mailto:${email}`}
          onClick={() => void trackEvent("email_clicked", listingId)}
          className={cn(row, "border-line text-plum hover:border-plum")}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          E-mail
        </a>
      ) : null}
      {website ? (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={() => void trackEvent("website_clicked", listingId)}
          className={cn(row, "border-line text-plum hover:border-plum")}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          Web stranica
        </a>
      ) : null}
      <div className="flex gap-2">
        {instagram ? (
          <a
            href={instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace(/^@/, "")}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="Instagram profil"
            className={cn(row, "border-line text-plum hover:border-plum")}
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}
        {facebook ? (
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label="Facebook stranica"
            className={cn(row, "border-line text-plum hover:border-plum")}
          >
            <Facebook className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

/** Sticky CTA traka na dnu ekrana za mobilne uređaje. */
export function MobileContactBar({
  listingId,
  phone,
  whatsapp,
}: {
  listingId: number;
  phone: string | null;
  whatsapp: string | null;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgb(46_24_56/0.1)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg gap-2">
        <a
          href="#kontakt-forma"
          className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-coral px-4 text-sm font-bold text-white hover:bg-coral-dark"
        >
          Pošalji upit
        </a>
        {phone ? (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            onClick={() => void trackEvent("phone_clicked", listingId)}
            aria-label="Nazovi"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-plum px-4 text-white"
          >
            <Phone className="h-5 w-5" aria-hidden="true" />
          </a>
        ) : null}
        {whatsapp ? (
          <a
            href={`https://wa.me/${normalizeWhatsapp(whatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void trackEvent("whatsapp_clicked", listingId)}
            aria-label="WhatsApp"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-teal px-4 text-white"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
