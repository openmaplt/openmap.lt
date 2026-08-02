"use client";

import type { Feature } from "geojson";
import type { MapGeoJSONFeature } from "maplibre-gl";
import { useCallback } from "react";
import { POI_INFO_PROFILES } from "@/config/map-profiles";
import { getPoiInfo } from "@/data/poiInfo";
import type { MapFeature } from "@/providers/MapProvider";

export function usePoiEnrichment(mapType?: string | null) {
  const enrichFeature = useCallback(
    async (feature: Feature | null): Promise<MapFeature | null> => {
      if (!feature) return null;

      const id = feature.properties?.id;
      const source = (feature as MapGeoJSONFeature).source;
      const sourceLayer = (feature as MapGeoJSONFeature).sourceLayer;

      // Protected areas (STVK API) and DB-backed profiles (places, craftbeer)
      // get their full attributes from getPoiInfo, whether the feature came
      // from a tile click or from search (a point with no tile source). Tile
      // geometry/source/sourceLayer are kept so a polygon still highlights.
      if (id && mapType && POI_INFO_PROFILES.has(mapType)) {
        try {
          const info = (await getPoiInfo(id, mapType)) as MapFeature | null;
          if (info?.properties) {
            return {
              type: "Feature",
              id: feature.id,
              geometry: feature.geometry,
              properties: { ...feature.properties, ...info.properties },
              source,
              sourceLayer,
              ...(info.extent ? { extent: info.extent } : {}),
            };
          }
        } catch (error) {
          console.error("Error fetching enriched POI info:", error);
        }
      }

      return feature;
    },
    [mapType],
  );

  return { enrichFeature };
}
