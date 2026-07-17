import "server-only";

import { fetchAreaPhotos, type StvkPhoto } from "./api";

/**
 * In-memory cache for protected-area photo blobs. Next's data cache
 * (unstable_cache) can't hold these — the base64 payload routinely exceeds its
 * 2 MB per-entry limit — so we keep a small bounded map ourselves. Storing the
 * in-flight promise dedupes the burst of parallel image requests a single
 * gallery fires (list + one per photo) into one upstream fetch.
 */

interface PhotoCacheEntry {
  expiresAt: number;
  promise: Promise<StvkPhoto[]>;
}
const photoCache = new Map<string, PhotoCacheEntry>();
const PHOTO_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const PHOTO_CACHE_MAX_ENTRIES = 30;

/**
 * Fetch all photos for a protected area, cached in memory for a TTL. Empty
 * results aren't cached, so a transient failure is retried.
 */
export function getProtectedAreaPhotos(id: string): Promise<StvkPhoto[]> {
  const now = Date.now();

  const cached = photoCache.get(id);
  if (cached && now < cached.expiresAt) {
    return cached.promise;
  }

  // Drop expired entries; if still at the cap, evict the oldest (insertion
  // order) to bound memory — each blob is a couple of MB.
  for (const [key, entry] of photoCache) {
    if (now >= entry.expiresAt) photoCache.delete(key);
  }
  if (photoCache.size >= PHOTO_CACHE_MAX_ENTRIES) {
    const oldest = photoCache.keys().next().value;
    if (oldest !== undefined) photoCache.delete(oldest);
  }

  const promise = fetchAreaPhotos(id);
  photoCache.set(id, { expiresAt: now + PHOTO_CACHE_TTL_MS, promise });

  // Don't pin empty results (no photos / transient error) — let them retry.
  promise.then((photos) => {
    if (photos.length === 0) photoCache.delete(id);
  });

  return promise;
}
