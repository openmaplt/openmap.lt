import type { LngLatBoundsLike } from "maplibre-gl";

export const BASE_URL = process.env.BASE_URL ?? "https://openmap.lt";

type Config = {
  DEFAULT_MAP_TYPE: string;
  DEFAULT_STYLE_MAP: string;
  DEFAULT_LATITUDE: number;
  DEFAULT_LONGITUDE: number;
  DEFAULT_ZOOM: number;
  MIN_ZOOM: number;
  MAX_ZOOM: number;
  BOUNDS: LngLatBoundsLike;
};

export const MapConfig: Config = {
  DEFAULT_MAP_TYPE: "m",
  DEFAULT_STYLE_MAP: "/styles/map.json",
  DEFAULT_LATITUDE: 55.19114,
  DEFAULT_LONGITUDE: 23.871,
  DEFAULT_ZOOM: 7,
  MIN_ZOOM: 7,
  MAX_ZOOM: 18,
  BOUNDS: [20.7, 53.7, 27.05, 56.65],
};

// A handful of reusable tiers instead of one hand-tuned limit per action —
// new features pick the tier that matches their traffic shape/risk instead of
// growing this list forever (see checkRateLimit in src/lib/rateLimit.ts).
export const RATE_LIMIT_TIERS = {
  // Continuous, client-driven reads (map pan/zoom, search-as-you-type).
  frequent: { limit: 300, windowMs: 10_000 },
  // Normal data reads (lists, detail lookups, session checks).
  standard: { limit: 120, windowMs: 10_000 },
  // State-changing actions (create/update/delete, login/logout/unlink).
  mutation: { limit: 30, windowMs: 10_000 },
  // Abuse-prone actions worth a stricter, longer window (posting content,
  // starting an auth flow).
  strict: { limit: 10, windowMs: 60_000 },
} as const;
