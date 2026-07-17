import "server-only";

import bboxPolygon from "@turf/bbox-polygon";
import center from "@turf/center";
import { toWgs84 } from "@turf/projection";
import type { Feature, Point } from "geojson";
import type { LngLatBoundsLike } from "maplibre-gl";
import { fetchProtectedArea, type StvkProtectedArea } from "./api";

/**
 * Shapes a raw STVK protected-area record into the Feature the POI panel/SEO
 * layer consumes. The API record carries no geometry (`geom` is always null)
 * and only a bounding box in EPSG:3857; the polygon outline comes from the
 * `stvk` vector tiles, so here we only derive a centroid (for the POI marker)
 * and an extent (for deep-link map bounds).
 */

// STVK uses this sentinel string for "no data"; treat it as absent.
const NO_DATA = "Nėra duomenų";

/** The Feature shape the client/SEO layer expects from `getPoiInfo`. */
type ProtectedAreaFeature = Feature<Point> & {
  extent?: LngLatBoundsLike;
};

function buildExtentAndCenter(area: StvkProtectedArea): {
  extent?: LngLatBoundsLike;
  center: [number, number] | null;
} {
  const { x_min, y_min, x_max, y_max } = area;
  if (
    x_min == null ||
    y_min == null ||
    x_max == null ||
    y_max == null ||
    !Number.isFinite(x_min) ||
    !Number.isFinite(y_min) ||
    !Number.isFinite(x_max) ||
    !Number.isFinite(y_max)
  ) {
    return { extent: undefined, center: null };
  }

  // The STVK bbox is EPSG:3857 (Web Mercator); project the corners to WGS84.
  const [minLng, minLat] = toWgs84([x_min, y_min] as [number, number]);
  const [maxLng, maxLat] = toWgs84([x_max, y_max] as [number, number]);

  const [centerLng, centerLat] = center(
    bboxPolygon([minLng, minLat, maxLng, maxLat]),
  ).geometry.coordinates;

  return {
    extent: [minLng, minLat, maxLng, maxLat],
    center: [centerLng, centerLat],
  };
}

// Round to 2 decimals and drop trailing zeros / float noise (3.45000005 → 3.45).
function formatNumber(n: number): string {
  return Number(n.toFixed(2)).toString();
}

function formatArea(ha: number): string {
  if (ha >= 1) {
    return `${formatNumber(ha)} ha`;
  }
  // Sub-hectare objects read better in m² (1 ha = 10 000 m²).
  return `${Math.round(ha * 10_000)} m²`;
}

/**
 * Compose the Lithuanian Markdown description shown in the POI panel. Mirrors
 * the field set our old DB `description` carried: Plotas, Pobūdis, Rūšis,
 * Steigėjas, Steigimo data, Steigimo tikslas, Tarptautinė svarba, Vieta.
 */
function buildDescription(area: StvkProtectedArea): string | undefined {
  const lines: string[] = [];
  const add = (label: string, value: string | null | undefined) => {
    if (value && value !== NO_DATA) lines.push(`**${label}:** ${value}`);
  };

  add("Plotas", area.plotas != null ? formatArea(area.plotas) : null);
  add("Pobūdis", area.pobudis);
  add("Rūšis", area.rusis);
  add("Steigėjas", area.steigejas);
  add("Steigimo data", area.steig_data ? area.steig_data.slice(0, 10) : null);
  add("Steigimo tikslas", area.steig_tikslas);
  add("Tarptautinė svarba", area.tarpt_svarba_status);
  add("Vieta", area.vieta);

  if (lines.length === 0) return undefined;
  // Markdown hard line breaks: two trailing spaces + newline.
  return lines.join("  \n");
}

function toFeature(area: StvkProtectedArea): ProtectedAreaFeature {
  const { extent, center } = buildExtentAndCenter(area);

  const properties: Record<string, string> = { id: area.id };
  if (area.pavadinimas) properties.name = area.pavadinimas;

  const description = buildDescription(area);
  if (description) properties.description = description;

  return {
    type: "Feature",
    id: area.id,
    geometry: center ? { type: "Point", coordinates: center } : null,
    properties,
    ...(extent && { extent }),
  } as ProtectedAreaFeature;
}

/**
 * Fetch a protected area and shape it into the Feature the POI panel/SEO layer
 * consumes. Returns null on any failure so the caller can fall back to the
 * plain vector-tile feature.
 */
export async function getProtectedArea(
  id: string,
): Promise<ProtectedAreaFeature | null> {
  const area = await fetchProtectedArea(id);
  return area ? toFeature(area) : null;
}
