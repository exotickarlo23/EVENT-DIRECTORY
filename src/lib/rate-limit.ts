import "server-only";

/**
 * Jednostavan in-memory rate limiter po ključu (IP + naziv forme).
 * Za single-instance deployment; kod horizontalnog skaliranja zamijeniti
 * Redis/Upstash implementacijom (isti interface).
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): { ok: boolean } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  bucket.count += 1;
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }
  return { ok: bucket.count <= limit };
}
