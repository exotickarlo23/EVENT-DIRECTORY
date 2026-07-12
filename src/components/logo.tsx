import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * Wordmark slavimo.hr — navy krug s coral iskrom + dvobojni tekst.
 * Boje dolaze iz brend pa, a naziv iz centralne konfiguracije
 * (promjena imena → automatski se odražava ovdje).
 */
export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  const name = siteConfig.name;
  const dotIndex = name.lastIndexOf(".");
  const base = dotIndex > 0 ? name.slice(0, dotIndex) : name;
  const tld = dotIndex > 0 ? name.slice(dotIndex) : "";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <SparkMark className="h-8 w-8 shrink-0" />
      <span className="font-display text-2xl font-bold tracking-tight">
        <span className={onDark ? "text-white" : "text-plum"}>{base}</span>
        <span className="text-coral">{tld}</span>
      </span>
    </span>
  );
}

/**
 * Znak: navy krug, coral „swoosh" luk i centralna četverokraka iskra.
 * Radi na svijetloj i tamnoj pozadini te kao favicon.
 */
export function SparkMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill="#1f3a5c" />
      {/* coral swoosh (rep) donji-lijevi */}
      <path
        d="M20 39a19 19 0 0 1-14.8-30.9A15 15 0 0 0 26 31.5 19 19 0 0 1 20 39z"
        fill="#ef6a4c"
      />
      {/* četverokraka iskra */}
      <path
        d="M20 8c.9 5.5 2.6 7.2 8.1 8.1-5.5.9-7.2 2.6-8.1 8.1-.9-5.5-2.6-7.2-8.1-8.1C17.4 15.2 19.1 13.5 20 8z"
        fill="#ef6a4c"
      />
    </svg>
  );
}
