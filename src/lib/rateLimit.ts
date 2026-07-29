import "server-only";

import { headers } from "next/headers";
import { RATE_LIMIT_TIERS } from "@/config/config";

export type RateLimitTier = keyof typeof RATE_LIMIT_TIERS;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function sweepExpired(now: number) {
  if (buckets.size < 5000) {
    return;
  }
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return h.get("x-real-ip") ?? "unknown";
}

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

// Only the high-volume, client-driven actions are throttled (map data + search).
// The catalog and POI-detail pages back server-rendered, indexable content that
// crawlers must be able to fetch freely, so those data functions are not
// rate-limited at all — a User-Agent allowlist would be trivially spoofable
// anyway.
//
// `action` is just a free-form bucket label (keeps e.g. commentCreate and
// commentDelete counted separately) — the actual limit/window comes from
// `tier`, one of a handful of reusable tiers in RATE_LIMIT_TIERS, so adding a
// new rate-limited action never requires a new config entry.
export async function checkRateLimit(action: string, tier: RateLimitTier) {
  const { limit, windowMs } = RATE_LIMIT_TIERS[tier];
  const ip = await getClientIp();
  return isRateLimited(`${action}:${ip}`, limit, windowMs);
}

// IP-based limiting alone is spoofable via a forged X-Forwarded-For header.
// For actions gated behind a session, also key a bucket on the user id so
// rotating the header can't bypass the limit for an authenticated abuser.
export function checkUserRateLimit(
  action: string,
  userId: number,
  tier: RateLimitTier,
) {
  const { limit, windowMs } = RATE_LIMIT_TIERS[tier];
  return isRateLimited(`${action}:user:${userId}`, limit, windowMs);
}
