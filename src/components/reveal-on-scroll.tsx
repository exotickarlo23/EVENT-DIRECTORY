"use client";

import { useEffect } from "react";

/**
 * Jedan IntersectionObserver za cijelu stranicu — otkriva elemente s klasom
 * `.reveal` kad uđu u vidokrug. Progresivno poboljšanje: klasa `js-reveal` na
 * <html> aktivira početno skrivanje samo kad JS radi, pa bez JS-a ništa nije
 * skriveno. Poštuje `prefers-reduced-motion` (preko CSS-a).
 */
export function RevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    root.classList.add("js-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)").forEach((el) => {
        observer.observe(el);
      });
    };
    scan();

    // Nove sekcije nakon navigacije (App Router) — ponovno skeniraj.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mo.disconnect();
      root.classList.remove("js-reveal");
    };
  }, []);

  return null;
}
