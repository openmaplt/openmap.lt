"use client";

import type { Feature } from "geojson";
import { useCallback, useRef } from "react";
import { getPoiInfo } from "@/data/poiInfo";

export function usePoiEnrichment() {
  const enrichedCacheRef = useRef<Record<string, Feature>>({});

  const enrichFeature = useCallback(
    async (feature: Feature | null): Promise<Feature | null> => {
      if (!feature) return null;

      const featureWithSource = feature as any;
      const id = feature.properties?.id;
      const source = featureWithSource.source;

      if (source === "stvk" && id) {
        const cacheKey = `${source}:${id}`;
        if (enrichedCacheRef.current[cacheKey]) {
          return enrichedCacheRef.current[cacheKey];
        }

        try {
          const poiFeature = await getPoiInfo(id, "s");
          if (poiFeature) {
            enrichedCacheRef.current[cacheKey] = poiFeature;
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
