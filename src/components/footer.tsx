import Link from "next/link";
import { Instagram, Facebook, Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import { siteConfig } from "@/config/site";
import type { NavTaxonomyItem } from "@/components/header";

export function Footer({
  categories,
  locations,
  occasions,
  guides,
}: {
  categories: NavTaxonomyItem[];
  locations: NavTaxonomyItem[];
  occasions: NavTaxonomyItem[];
  guides: NavTaxonomyItem[];
}) {
  return (
    <footer className="mt-20 bg-plum text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo onDark />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              {siteConfig.tagline} Katalog i tražilica event-usluga u Hrvatskoj — prostori,
              zabava, catering, dekoracije, fotografi i oprema na jednom mjestu.
            </p>
            <div className="mt-5 flex gap-3">
              {siteConfig.social.instagram ? (
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Feštko na Instagramu"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                >
                  <Instagram className="h-5 w-5" aria-hidden="true" />
                </a>
              ) : null}
              {siteConfig.social.facebook ? (
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Feštko na Facebooku"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                >
                  <Facebook className="h-5 w-5" aria-hidden="true" />
                </a>
              ) : null}
              <a
                href={`mailto:${siteConfig.contact.email}`}
                aria-label="Pošalji e-mail Feštku"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <FooterColumn title="Popularne usluge">
            {categories.slice(0, 8).map((c) => (
              <FooterLink key={c.slug} href={`/usluge/${c.slug}`}>
                {c.name}
              </FooterLink>
            ))}
            <FooterLink href="/usluge">Sve usluge →</FooterLink>
          </FooterColumn>

          <FooterColumn title="Lokacije i prigode">
            {locations.slice(0, 5).map((l) => (
              <FooterLink key={l.slug} href={`/lokacije/${l.slug}`}>
                {l.name}
              </FooterLink>
            ))}
            {occasions.slice(0, 4).map((o) => (
              <FooterLink key={o.slug} href={`/prigode/${o.slug}`}>
                {o.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Feštko">
            <FooterLink href="/kako-funkcionira">Kako funkcionira</FooterLink>
            <FooterLink href="/postani-partner">Postani partner</FooterLink>
            <FooterLink href="/cjenik">Cjenik</FooterLink>
            <FooterLink href="/dodaj-poslovanje">Dodaj poslovanje</FooterLink>
            {guides.slice(0, 2).map((g) => (
              <FooterLink key={g.slug} href={`/vodici/${g.slug}`}>
                {g.name}
              </FooterLink>
            ))}
            <FooterLink href="/vodici">Svi vodiči</FooterLink>
            <FooterLink href="/o-nama">O nama</FooterLink>
            <FooterLink href="/kontakt">Kontakt</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Sva prava pridržana.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/pravila-koristenja" className="hover:text-white">
              Pravila korištenja
            </Link>
            <Link href="/politika-privatnosti" className="hover:text-white">
              Politika privatnosti
            </Link>
            <Link href="/kolacici" className="hover:text-white">
              Kolačići
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-gold">{title}</h2>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm hover:text-white">
        {children}
      </Link>
    </li>
  );
}
