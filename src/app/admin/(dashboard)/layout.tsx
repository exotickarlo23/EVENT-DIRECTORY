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
import { Logo } from "@/components/logo";

export const metadata = {
  robots: { index: false, follow: false },
};

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
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-sand"
                >
                  <item.icon className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
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
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2 font-bold text-plum [&::-webkit-details-marker]:hidden">
              Feštko Admin — izbornik
            </summary>
            <nav aria-label="Admin navigacija (mobilno)" className="mt-2 grid grid-cols-2 gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-sand"
                >
                  {item.label}
                </Link>
              ))}
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
