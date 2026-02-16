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

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const handleMapClick = async (e: MapLayerMouseEvent) => {
      const activeLayers = layers.filter((l) => map.getLayer(l));

      // Find features from our target layers
      const interactiveFeatures = map.queryRenderedFeatures(e.point, {
        layers: activeLayers,
      });

      if (interactiveFeatures.length > 0) {
        const feature = interactiveFeatures[0] as Feature;
        const enriched = await enrichFeature(feature);
        onSelectFeature(enriched);
      } else {
        onSelectFeature(null);
      }
    };

    const cleanup = () => {
      map.off("click", handleMapClick);
      for (const layerId of layers) {
        if (map.getLayer(layerId)) {
          map.off("mouseenter", layerId, handleMouseEnter);
          map.off("mouseleave", layerId, handleMouseLeave);
        }
      }
    };

    const setupHandlers = () => {
      cleanup();
      map.on("click", handleMapClick);
      for (const layerId of layers) {
        if (map.getLayer(layerId)) {
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
      cleanup();
      map.off("styledata", setupHandlers);
    };
  }, [mapRef, layers, onSelectFeature, enabled, enrichFeature]);
}
