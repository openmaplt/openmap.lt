"use client";

import type { Feature } from "geojson";
import { useCallback } from "react";
import { getPoiInfo } from "@/data/poiInfo";

export function usePoiEnrichment() {
  const enrichFeature = useCallback(
    async (feature: Feature | null): Promise<Feature | null> => {
      if (!feature) return null;

      const featureWithSource = feature as any;
      const id = feature.properties?.id;
      const source = featureWithSource.source;

      if (source === "stvk" && id) {
        try {
          const poiFeature = await getPoiInfo(id, "s");
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
    [],
  );

  return { enrichFeature };
}
