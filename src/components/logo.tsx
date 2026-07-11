import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

/**
 * Privremeni tipografski wordmark s originalnim simbolom iskre.
 * Zamijeniti pravim SVG logotipom kada bude dostupan — koristi se
 * u headeru, footeru i adminu, pa je promjena na jednom mjestu.
 */
export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <SparkMark className="h-7 w-7 shrink-0" />
      <span
        className={cn(
          "font-display text-2xl font-bold tracking-tight",
          onDark ? "text-white" : "text-plum"
        )}
      >
        {siteConfig.name}
      </span>
    </span>
  );
}

export function SparkMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="#F45F5A" />
      <path
        d="M16 6.5l2.2 6.4 6.8.4-5.3 4.3 1.8 6.6L16 20.5l-5.5 3.7 1.8-6.6-5.3-4.3 6.8-.4z"
        fill="#FFF9F2"
      />
      <circle cx="25" cy="7" r="2" fill="#F3C85B" />
    </svg>
  );
}
