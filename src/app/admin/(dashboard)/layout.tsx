import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Inbox,
  BadgeCheck,
  Building2,
  Upload,
  FolderTree,
  MapPin,
  PartyPopper,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { getAdminSession } from "@/lib/auth";
import { adminLogout } from "@/lib/actions/admin";
import { getAdminNavBadges } from "@/lib/admin-queries";
import { Logo } from "@/components/logo";

export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/oglasi", label: "Oglasi", icon: ListChecks },
  { href: "/admin/upiti", label: "Upiti", icon: Inbox },
  { href: "/admin/zahtjevi-za-preuzimanje", label: "Zahtjevi za preuzimanje", icon: BadgeCheck },
  { href: "/admin/prijave-poslovanja", label: "Prijave poslovanja", icon: Building2 },
  { href: "/admin/import", label: "CSV import", icon: Upload },
  { href: "/admin/kategorije", label: "Kategorije", icon: FolderTree },
  { href: "/admin/lokacije", label: "Lokacije", icon: MapPin },
  { href: "/admin/prigode", label: "Prigode", icon: PartyPopper },
  { href: "/admin/clanci", label: "Članci", icon: FileText },
  { href: "/admin/postavke", label: "Postavke", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const badges = getAdminNavBadges();
  const totalPending = Object.values(badges).reduce((sum, n) => sum + n, 0);

  return (
    <div className="flex min-h-screen bg-sand/40">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-white lg:flex">
        <div className="border-b border-line p-5">
          <Link href="/admin">
            <Logo />
          </Link>
          <p className="mt-1 text-xs text-muted">Admin · {session.email}</p>
        </div>
        <nav aria-label="Admin navigacija" className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {NAV.map((item) => {
              const count = badges[item.href] ?? 0;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-sand"
                  >
                    <span className="relative flex shrink-0">
                      <item.icon className="h-4 w-4 text-muted" aria-hidden="true" />
                      {count > 0 && (
                        <span
                          className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-coral ring-2 ring-white"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {count > 0 && (
                      <span
                        className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-coral px-1.5 py-0.5 text-xs font-bold leading-none text-white"
                        aria-label={`${count} novih za pregled`}
                      >
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-line p-3">
          <Link href="/" className="block rounded-lg px-3 py-2 text-sm font-semibold text-teal hover:bg-sand">
            ← Javna stranica
          </Link>
          <form action={adminLogout}>
            <button
              type="submit"
              className="flex w-full min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-coral-dark hover:bg-sand"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Odjava
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobilna admin navigacija */}
        <div className="sticky top-0 z-40 border-b border-line bg-white p-3 lg:hidden">
          <details>
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 font-bold text-plum [&::-webkit-details-marker]:hidden">
              <span>slavimo.hr Admin — izbornik</span>
              {totalPending > 0 && (
                <span
                  className="inline-flex min-w-5 items-center justify-center rounded-full bg-coral px-1.5 py-0.5 text-xs font-bold leading-none text-white"
                  aria-label={`${totalPending} aktivnosti za pregled`}
                >
                  {totalPending > 99 ? "99+" : totalPending}
                </span>
              )}
            </summary>
            <nav aria-label="Admin navigacija (mobilno)" className="mt-2 grid grid-cols-2 gap-1">
              {NAV.map((item) => {
                const count = badges[item.href] ?? 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-sand"
                  >
                    <span>{item.label}</span>
                    {count > 0 && (
                      <span
                        className="inline-flex min-w-5 items-center justify-center rounded-full bg-coral px-1.5 py-0.5 text-xs font-bold leading-none text-white"
                        aria-label={`${count} novih za pregled`}
                      >
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </Link>
                );
              })}
              <form action={adminLogout} className="col-span-2">
                <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-coral-dark hover:bg-sand">
                  Odjava
                </button>
              </form>
            </nav>
          </details>
        </div>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
