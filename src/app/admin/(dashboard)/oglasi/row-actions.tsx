"use client";

import Link from "next/link";
import { useTransition } from "react";
import { setListingStatus, duplicateListing, deleteListing } from "@/lib/actions/admin";
import type { ListingStatus } from "@/lib/db/schema";

export function RowActions({ id, status, slug }: { id: number; status: string; slug: string }) {
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn();
    });
  }

  const btn = "rounded px-2 py-1 text-xs font-bold hover:bg-sand disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Link href={`/admin/oglasi/${id}`} className={`${btn} text-plum`}>
        Uredi
      </Link>
      {status === "published" ? (
        <>
          <Link href={`/ponudaci/${slug}`} target="_blank" className={`${btn} text-teal`}>
            Pogledaj
          </Link>
          <button type="button" disabled={pending} onClick={() => run(() => setListingStatus(id, "paused"))} className={`${btn} text-plum`}>
            Pauziraj
          </button>
        </>
      ) : (
        <button type="button" disabled={pending} onClick={() => run(() => setListingStatus(id, "published"))} className={`${btn} text-teal`}>
          Objavi
        </button>
      )}
      <button type="button" disabled={pending} onClick={() => run(() => duplicateListing(id))} className={`${btn} text-plum`}>
        Dupliciraj
      </button>
      {status !== "archived" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => setListingStatus(id, "archived" as ListingStatus))}
          className={`${btn} text-muted`}
        >
          Arhiviraj
        </button>
      ) : null}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Trajno izbrisati ovaj oglas? Ova radnja se ne može poništiti.")) {
            run(() => deleteListing(id));
          }
        }}
        className={`${btn} text-coral-dark`}
      >
        Izbriši
      </button>
    </div>
  );
}
