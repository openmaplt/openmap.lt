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
