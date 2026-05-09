"use client";

import type { Feature } from "geojson";
import type { MapGeoJSONFeature } from "maplibre-gl";
import { useCallback } from "react";
import { getPoiInfo } from "@/data/poiInfo";

export function usePoiEnrichment(mapType?: string | null) {
  const enrichFeature = useCallback(
    async (feature: Feature | null): Promise<Feature | null> => {
      if (!feature) return null;

      const id = feature.properties?.id;
      const source = (feature as MapGeoJSONFeature).source;

      if (source === "stvk" && id) {
        try {
          const poiFeature = await getPoiInfo(id, mapType);
          console.log("Enriched POI info:", poiFeature);
          if (poiFeature) {
            return poiFeature;
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
