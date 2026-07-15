import "server-only";

import { headers } from "next/headers";
import { RATE_LIMITS } from "@/config/config";

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
export async function checkRateLimit(action: keyof typeof RATE_LIMITS) {
  const { limit, windowMs } = RATE_LIMITS[action];
  const ip = await getClientIp();
  return isRateLimited(`${action}:${ip}`, limit, windowMs);
}
