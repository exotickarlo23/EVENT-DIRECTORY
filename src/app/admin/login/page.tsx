import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession, isAdminAuthConfigured } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin prijava",
  robots: { index: false, follow: false },
};

// Stranica ovisi o runtime env varijablama i sessionu — ne smije se prerenderirati
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  const configured = isAdminAuthConfigured();
  const isDev = process.env.NODE_ENV !== "production";
  const usingDevFallback = isDev && !process.env.ADMIN_PASSWORD_HASH;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Logo className="justify-center" />
          <p className="mt-2 text-sm text-muted">Administratorsko sučelje</p>
        </div>
        <div className="rounded-card border border-line bg-white p-6 shadow-card">
          {!configured ? (
            <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral-dark">
              Admin autentikacija nije konfigurirana. Postavi AUTH_SECRET, ADMIN_EMAIL i
              ADMIN_PASSWORD_HASH environment varijable (vidi .env.example).
            </p>
          ) : (
            <>
              <LoginForm />
              {usingDevFallback ? (
                <p className="mt-4 rounded-xl bg-gold/20 px-3 py-2 text-xs text-plum">
                  Development pristup: <strong>admin@festko.local</strong> / <strong>festko-dev</strong>{" "}
                  (vrijedi samo lokalno, nikad u produkciji).
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
