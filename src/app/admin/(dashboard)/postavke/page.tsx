import { siteConfig } from "@/config/site";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default function AdminPostavkePage() {
  const envStatus = [
    { key: "AUTH_SECRET", set: Boolean(process.env.AUTH_SECRET) },
    { key: "ADMIN_EMAIL", set: Boolean(process.env.ADMIN_EMAIL) },
    { key: "ADMIN_PASSWORD_HASH", set: Boolean(process.env.ADMIN_PASSWORD_HASH) },
    { key: "NEXT_PUBLIC_SITE_URL", set: Boolean(process.env.NEXT_PUBLIC_SITE_URL) },
    { key: "EMAIL_PROVIDER", set: Boolean(process.env.EMAIL_PROVIDER) },
    { key: "RESEND_API_KEY", set: Boolean(process.env.RESEND_API_KEY) },
    { key: "ADMIN_NOTIFY_EMAIL", set: Boolean(process.env.ADMIN_NOTIFY_EMAIL) },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 font-display text-2xl font-bold text-plum md:text-3xl">Postavke</h1>

      <section className="rounded-card border border-line bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-plum">Brend (config/site.ts)</h2>
        <p className="mt-1 text-sm text-muted">
          Naziv, tagline, kontakti i društvene mreže uređuju se centralno u{" "}
          <code className="rounded bg-sand px-1">src/config/site.ts</code>.
        </p>
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex gap-2"><dt className="font-semibold text-muted">Naziv:</dt><dd>{siteConfig.name}</dd></div>
          <div className="flex gap-2"><dt className="font-semibold text-muted">Tagline:</dt><dd>{siteConfig.tagline}</dd></div>
          <div className="flex gap-2"><dt className="font-semibold text-muted">URL:</dt><dd>{siteConfig.url}</dd></div>
          <div className="flex gap-2"><dt className="font-semibold text-muted">E-mail:</dt><dd>{siteConfig.contact.email}</dd></div>
        </dl>
      </section>

      <section className="mt-6 rounded-card border border-line bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-semibold text-plum">Environment varijable</h2>
        <p className="mt-1 text-sm text-muted">
          Status konfiguracije (vrijednosti se ne prikazuju). Detalji u .env.example.
        </p>
        <ul className="mt-4 space-y-2">
          {envStatus.map((e) => (
            <li key={e.key} className="flex items-center justify-between text-sm">
              <code>{e.key}</code>
              <Badge variant={e.set ? "success" : "warning"}>{e.set ? "postavljeno" : "nije postavljeno"}</Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
