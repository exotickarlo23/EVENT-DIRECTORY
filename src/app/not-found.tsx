import Link from "next/link";
import { SparkMark } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <SparkMark className="h-14 w-14" />
      <h1 className="mt-6 font-display text-4xl font-bold text-plum">Stranica nije pronađena</h1>
      <p className="mt-3 max-w-md text-muted">
        Ova stranica ne postoji ili je premještena. Možda tražiš neku od usluga za svoju proslavu?
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white hover:bg-coral-dark"
        >
          Na naslovnicu
        </Link>
        <Link
          href="/usluge"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-plum/15 bg-white px-6 py-2.5 text-sm font-semibold text-plum hover:border-plum/40"
        >
          Pronađi uslugu
        </Link>
      </div>
    </div>
  );
}
