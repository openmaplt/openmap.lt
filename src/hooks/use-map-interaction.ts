"use client";

import type { Feature } from "geojson";
import type { MapLayerMouseEvent } from "maplibre-gl";
import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";
import { usePoiEnrichment } from "./use-poi-enrichment";

interface UseMapInteractionProps {
  layers: string[];
  onSelectFeature: (feature: Feature | null) => void;
  enabled?: boolean;
}

export function useMapInteraction({
  layers,
  onSelectFeature,
  enabled = true,
}: UseMapInteractionProps) {
  const { current: mapRef } = useMap();
  const { enrichFeature } = usePoiEnrichment();

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map || !enabled) return;

    const handleLayerClick = async (e: MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const enriched = await enrichFeature(e.features[0] as Feature);
        onSelectFeature(enriched);
      }
    };

    const handleMapClick = (e: MapLayerMouseEvent) => {
      // Check if any of the target layers were clicked
      const interactiveFeatures = map.queryRenderedFeatures(e.point, {
        layers: layers.filter((l) => map.getLayer(l)),
      });

      if (interactiveFeatures.length === 0) {
        onSelectFeature(null);
      }
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const setupHandlers = () => {
      map.on("click", handleMapClick);
      for (const layerId of layers) {
        if (map.getLayer(layerId)) {
          map.on("click", layerId, handleLayerClick);
          map.on("mouseenter", layerId, handleMouseEnter);
          map.on("mouseleave", layerId, handleMouseLeave);
        }
      }
    };

    if (map.isStyleLoaded()) {
      setupHandlers();
    }
    map.on("styledata", setupHandlers);

    return () => {
      map.off("click", handleMapClick);
      map.off("styledata", setupHandlers);
      for (const layerId of layers) {
        map.off("click", layerId, handleLayerClick);
        map.off("mouseenter", layerId, handleMouseEnter);
        map.off("mouseleave", layerId, handleMouseLeave);
      }
    };
  }, [mapRef, layers, onSelectFeature, enabled, enrichFeature]);
}
