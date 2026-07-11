import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "festko_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 sati

const DEV_FALLBACK_EMAIL = "admin@festko.local";
const DEV_FALLBACK_PASSWORD = "festko-dev";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function getAuthSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) return secret;
  // U developmentu dopuštamo fiksni secret radi lakšeg pokretanja.
  if (!isProduction()) return "festko-development-secret-not-for-production";
  return null;
}

/**
 * Admin je fail-closed: u produkciji bez AUTH_SECRET + ADMIN_EMAIL +
 * ADMIN_PASSWORD_HASH prijava nije moguća.
 */
export function isAdminAuthConfigured(): boolean {
  if (!isProduction()) return true;
  return Boolean(
    getAuthSecret() && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH
  );
}

function verifyPassword(password: string, stored: string): boolean {
  // Format: scrypt:<salt-hex>:<hash-hex>
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltHex, hashHex] = parts;
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, saltHex, expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export function checkCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;

  if (adminEmail && adminHash) {
    return (
      email.trim().toLowerCase() === adminEmail.trim().toLowerCase() &&
      verifyPassword(password, adminHash)
    );
  }
  // Development fallback — NIKAD ne vrijedi u produkciji (fail-closed).
  if (!isProduction()) {
    return email.trim().toLowerCase() === DEV_FALLBACK_EMAIL && password === DEV_FALLBACK_PASSWORD;
  }
  return false;
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export async function createSession(email: string): Promise<void> {
  const secret = getAuthSecret();
  if (!secret) throw new Error("AUTH_SECRET nije konfiguriran");
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${email}|${expires}`;
  const token = `${Buffer.from(payload).toString("base64url")}.${sign(payload, secret)}`;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const secret = getAuthSecret();
  if (!secret || !isAdminAuthConfigured()) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) return null;
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = sign(payload, secret);
  if (
    expected.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return null;
  }
  const [email, expiresStr] = payload.split("|");
  if (!email || !expiresStr || Number(expiresStr) < Date.now()) return null;
  return { email };
}

export { SESSION_COOKIE };
