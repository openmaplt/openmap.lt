import type { Feature } from "geojson";
import type { MapSourceDataEvent } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useMapInteraction } from "@/hooks/use-map-interaction";
import { usePoiEnrichment } from "@/hooks/use-poi-enrichment";
import { getPoiFromObjectId } from "@/lib/poiHelpers";

interface PoiInteractionProps {
  poiId?: string | null;
  onSelectFeature: (feature: Feature | null) => void;
  layers?: string[];
}

export function PoiInteraction({
  onSelectFeature,
  poiId,
  layers = [],
}: PoiInteractionProps) {
  const { current: mapRef } = useMap();
  const { enrichFeature } = usePoiEnrichment();
  const lastSelectedPoiIdRef = useRef<string | null>(null);

  useMapInteraction({
    layers,
    onSelectFeature: async (feature) => {
      lastSelectedPoiIdRef.current =
        feature?.id ?? feature?.properties?.id ?? null;
      onSelectFeature(feature);
    },
  });

  // Handle object ID changes from URL
  useEffect(() => {
    if (!poiId) {
      onSelectFeature(null);
      lastSelectedPoiIdRef.current = null;
      return;
    }

    // If already selected, don't re-select
    if (lastSelectedPoiIdRef.current === poiId) return;

    const map = mapRef?.getMap();
    if (!map) return;

    const displayPoi = async () => {
      if (lastSelectedPoiIdRef.current === poiId) return;

      for (const layerId of layers) {
        const feature = getPoiFromObjectId(map, layerId, poiId);
        if (feature) {
          lastSelectedPoiIdRef.current = poiId;
          const enriched = await enrichFeature(feature);
          onSelectFeature(enriched);
          break;
        }
      }
    };

    const handleSourceData = (e: MapSourceDataEvent) => {
      if (e.isSourceLoaded) {
        displayPoi();
      }
    };

    if (map.isStyleLoaded()) {
      displayPoi();
    } else {
      map.once("load", displayPoi);
    }

    map.on("sourcedata", handleSourceData);

    return () => {
      if (!map) return;
      map.off("sourcedata", handleSourceData);
    };
  }, [mapRef, onSelectFeature, poiId, enrichFeature, layers]);

  return null;
}
