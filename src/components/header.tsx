"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, X, ChevronDown, Scale, Search } from "lucide-react";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui";
import { useFavorites } from "@/components/favorites-provider";
import { cn } from "@/lib/utils";

export interface NavTaxonomyItem {
  slug: string;
  name: string;
}

export function Header({
  categories,
  occasions,
}: {
  categories: NavTaxonomyItem[];
  occasions: NavTaxonomyItem[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"usluge" | "prigode" | null>(null);
  const { favorites, compare, ready } = useFavorites();
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Zatvori menije pri promjeni rute (navigacija je vanjski događaj)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Escape + klik izvan zatvara dropdown
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenDropdown(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all",
        scrolled || mobileOpen
          ? "border-b border-line bg-ivory/95 shadow-[0_2px_12px_rgb(46_24_56/0.06)] backdrop-blur"
          : "bg-ivory/60 backdrop-blur-sm"
      )}
    >
      <a
        href="#glavni-sadrzaj"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-plum focus:px-4 focus:py-2 focus:text-white"
      >
        Preskoči na sadržaj
      </a>
      <nav ref={navRef} aria-label="Glavna navigacija" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" aria-label="Feštko — naslovnica" className="shrink-0">
            <Logo />
          </Link>

          {/* Desktop navigacija */}
          <div className="hidden items-center gap-1 lg:flex">
            <DropdownNav
              label="Usluge"
              open={openDropdown === "usluge"}
              onToggle={() => setOpenDropdown(openDropdown === "usluge" ? null : "usluge")}
              items={categories.map((c) => ({ href: `/usluge/${c.slug}`, name: c.name }))}
              allHref="/usluge"
              allLabel="Sve usluge"
            />
            <DropdownNav
              label="Prigode"
              open={openDropdown === "prigode"}
              onToggle={() => setOpenDropdown(openDropdown === "prigode" ? null : "prigode")}
              items={occasions.map((o) => ({ href: `/prigode/${o.slug}`, name: o.name }))}
              allHref="/prigode"
              allLabel="Sve prigode"
            />
            <TopLink href="/vodici">Vodiči</TopLink>
            <TopLink href="/kako-funkcionira">Kako funkcionira</TopLink>
            <TopLink href="/postani-partner">Postani partner</TopLink>
          </div>

          <div className="flex items-center gap-2">
            {ready && compare.length > 0 ? (
              <Link
                href="/usporedi"
                className="relative hidden h-11 w-11 items-center justify-center rounded-full hover:bg-sand sm:inline-flex"
                aria-label={`Usporedba (${compare.length})`}
              >
                <Scale className="h-5 w-5 text-plum" aria-hidden="true" />
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal text-[10px] font-bold text-white">
                  {compare.length}
                </span>
              </Link>
            ) : null}
            <Link
              href="/favoriti"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand"
              aria-label={`Favoriti${ready && favorites.length > 0 ? ` (${favorites.length})` : ""}`}
            >
              <Heart className="h-5 w-5 text-plum" aria-hidden="true" />
              {ready && favorites.length > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral text-[10px] font-bold text-white">
                  {favorites.length}
                </span>
              ) : null}
            </Link>
            <ButtonLink href="/usluge" size="sm" className="hidden sm:inline-flex">
              <Search className="h-4 w-4" aria-hidden="true" />
              Pronađi uslugu
            </ButtonLink>
            <Link
              href="/dodaj-poslovanje"
              className="hidden text-sm font-semibold text-plum underline-offset-4 hover:underline xl:block"
            >
              Dodaj poslovanje
            </Link>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-sand lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobilni-menu"
              aria-label={mobileOpen ? "Zatvori izbornik" : "Otvori izbornik"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-6 w-6 text-plum" /> : <Menu className="h-6 w-6 text-plum" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobilni menu */}
      {mobileOpen ? (
        <div
          id="mobilni-menu"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-ivory px-4 pb-8 pt-4 lg:hidden"
        >
          <ButtonLink href="/usluge" className="mb-4 w-full">
            <Search className="h-4 w-4" aria-hidden="true" />
            Pronađi uslugu
          </ButtonLink>
          <MobileSection title="Usluge" items={categories.map((c) => ({ href: `/usluge/${c.slug}`, name: c.name }))} allHref="/usluge" />
          <MobileSection title="Prigode" items={occasions.map((o) => ({ href: `/prigode/${o.slug}`, name: o.name }))} allHref="/prigode" />
          <div className="mt-4 flex flex-col gap-1 border-t border-line pt-4">
            <MobileLink href="/vodici">Vodiči</MobileLink>
            <MobileLink href="/kako-funkcionira">Kako funkcionira</MobileLink>
            <MobileLink href="/postani-partner">Postani partner</MobileLink>
            <MobileLink href="/dodaj-poslovanje">Dodaj poslovanje</MobileLink>
            <MobileLink href="/favoriti">Favoriti</MobileLink>
            <MobileLink href="/usporedi">Usporedba</MobileLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function TopLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-2 text-sm font-semibold text-plum hover:bg-sand"
    >
      {children}
    </Link>
  );
}

function DropdownNav({
  label,
  open,
  onToggle,
  items,
  allHref,
  allLabel,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  items: { href: string; name: string }[];
  allHref: string;
  allLabel: string;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-plum hover:bg-sand",
          open && "bg-sand"
        )}
      >
        {label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-[560px] rounded-card border border-line bg-white p-4 shadow-card-hover">
          <ul className="grid grid-cols-2 gap-0.5">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-sand hover:text-plum"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={allHref}
            className="mt-2 block border-t border-line px-3 pt-3 text-sm font-bold text-coral hover:text-coral-dark"
          >
            {allLabel} →
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function MobileSection({
  title,
  items,
  allHref,
}: {
  title: string;
  items: { href: string; name: string }[];
  allHref: string;
}) {
  return (
    <details className="group border-t border-line py-2">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between py-2 text-base font-bold text-plum [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <ul className="pb-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="block min-h-11 rounded-lg px-3 py-2.5 text-sm text-ink hover:bg-sand">
              {item.name}
            </Link>
          </li>
        ))}
        <li>
          <Link href={allHref} className="block min-h-11 px-3 py-2.5 text-sm font-bold text-coral">
            Prikaži sve →
          </Link>
        </li>
      </ul>
    </details>
  );
}

function MobileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex min-h-11 items-center rounded-lg px-3 py-2.5 text-base font-semibold text-plum hover:bg-sand">
      {children}
    </Link>
  );
}
