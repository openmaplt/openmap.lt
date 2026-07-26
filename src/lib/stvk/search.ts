import "server-only";

import type { Feature, FeatureCollection, Point } from "geojson";
import { mercatorBboxToWgs84 } from "@/lib/geo";
import { fetchAreaSearch, type StvkSearchArea } from "./api";

/**
 * Text search over protected areas via the STVK API (the DB no longer mirrors
 * this data). The API has no geometry, only an EPSG:3857 bbox per hit, so each
 * result is shaped into a Point at the bbox centre — enough for the search list
 * and to fly to on selection, where it gets fully enriched by `getPoiInfo`.
 */

const EMPTY: FeatureCollection = { type: "FeatureCollection", features: [] };

function toFeature(area: StvkSearchArea, category: string): Feature | null {
  const projected = mercatorBboxToWgs84(
    area.xmin,
    area.ymin,
    area.xmax,
    area.ymax,
  );
  if (!projected) {
    return null;
  }

  return {
    type: "Feature",
    id: area.id,
    geometry: { type: "Point", coordinates: projected.center } as Point,
    properties: { id: area.id, name: area.name, category },
  };
}

export async function searchProtectedAreas(
  text: string,
): Promise<FeatureCollection> {
  const groups = await fetchAreaSearch(text);
  if (groups.length === 0) {
    return EMPTY;
  }

  const features: Feature[] = [];
  for (const group of groups) {
    for (const area of group.areas ?? []) {
      const feature = toFeature(area, group.typeName);
      if (feature) features.push(feature);
    }
  }

  return { type: "FeatureCollection", features };
}
