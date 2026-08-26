import distance from "@turf/distance";
import { point } from "@turf/helpers";
import { toWgs84 } from "@turf/projection";

/** WGS84 bounding box as [minLng, minLat, maxLng, maxLat]. */
export type Wgs84Bbox = [number, number, number, number];

/**
 * Convert an EPSG:3857 (Web Mercator) bounding box to a WGS84 extent and its
 * centre point. Returns null if any coordinate is missing or non-finite.
 * Provider-agnostic — any source giving a 3857 bbox can use it.
 */
export function mercatorBboxToWgs84(
  xmin: number | null | undefined,
  ymin: number | null | undefined,
  xmax: number | null | undefined,
  ymax: number | null | undefined,
): { extent: Wgs84Bbox; center: [number, number] } | null {
  if (
    xmin == null ||
    ymin == null ||
    xmax == null ||
    ymax == null ||
    !Number.isFinite(xmin) ||
    !Number.isFinite(ymin) ||
    !Number.isFinite(xmax) ||
    !Number.isFinite(ymax)
  ) {
    return null;
  }

  const [minLng, minLat] = toWgs84([xmin, ymin] as [number, number]);
  const [maxLng, maxLat] = toWgs84([xmax, ymax] as [number, number]);

  return {
    extent: [minLng, minLat, maxLng, maxLat],
    center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2],
  };
}

/**
 * Greedy nearest-neighbor ordering, not a real TSP solve — good enough for
 * the small point counts (single-digit) this is used with (e.g. an
 * AI-generated route through a handful of POIs), where GraphHopper's
 * multi-point /route visits points in the exact order given and has no
 * built-in optimization mode.
 */
export function orderNearestNeighbor<T extends { lng: number; lat: number }>(
  from: [number, number],
  points: T[],
): T[] {
  const remaining = [...points];
  const ordered: T[] = [];
  let current = point(from);

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < remaining.length; i++) {
      const d = distance(current, point([remaining[i].lng, remaining[i].lat]));
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }
    const [next] = remaining.splice(nearestIdx, 1);
    ordered.push(next);
    current = point([next.lng, next.lat]);
  }

  return ordered;
}

// No map profile actually sets config/map-profiles.ts's optional
// `routingUrl` field (checked: none of them do) — every profile, including
// "places", resolves to this same GraphHopper instance.
export const DEFAULT_ROUTING_URL = "https://api.openmap.lt/route/route";

export type GraphHopperPath = {
  distance: number;
  time: number;
  points: string;
  instructions: unknown[];
};

// Thrown when GraphHopper returns no path for the given points — callers
// decide how to surface that (client UI message vs. server-side "skip the
// stats" fallback).
export class RouteNotFoundError extends Error {}

/**
 * Calls GraphHopper's /route with points in visiting order (any points
 * between the first and last become via-points, not a separate "optimize"
 * mode — see orderNearestNeighbor above). Shared by the client routing hook
 * (src/hooks/use-routing.ts, which additionally decodes the polyline into a
 * GeoJSON line) and server-side AI route-summary building
 * (src/lib/aiSearchClient.ts, which only needs distance/time) — kept here,
 * not in src/lib/routeUtils.ts, because that file transitively imports
 * use-routing.ts for typing and thus pulls in client-only hooks (swr,
 * useDebouncedValue), which breaks a server bundle that imports it.
 */
export async function fetchGraphHopperRoute(
  points: [number, number][],
  profile: string,
  routingUrl: string = DEFAULT_ROUTING_URL,
): Promise<GraphHopperPath> {
  const url = new URL(routingUrl);
  for (const [lng, lat] of points) {
    url.searchParams.append("point", `${lat},${lng}`);
  }
  url.searchParams.append("profile", profile);
  url.searchParams.append("elevation", "false");
  url.searchParams.append("locale", "lt");
  url.searchParams.append("points_encoded", "true");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const path = data.paths?.[0];
  if (!path) {
    throw new RouteNotFoundError();
  }
  return path;
}
