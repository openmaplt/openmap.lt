"use client";

import type { Feature } from "geojson";
import type { MapGeoJSONFeature } from "maplibre-gl";
import { useCallback } from "react";
import { getPoiInfo } from "@/data/poiInfo";
import type { MapFeature } from "@/providers/MapProvider";

export function usePoiEnrichment(mapType?: string | null) {
  const enrichFeature = useCallback(
    async (feature: Feature | null): Promise<MapFeature | null> => {
      if (!feature) return null;

      const id = feature.properties?.id;
      const source = (feature as MapGeoJSONFeature).source;
      const sourceLayer = (feature as MapGeoJSONFeature).sourceLayer;

      if (source === "stvk" && id) {
        try {
          const info = (await getPoiInfo(id, mapType)) as MapFeature | null;
          if (info) {
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
