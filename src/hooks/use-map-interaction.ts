"use client";

import type { Feature } from "geojson";
import type { MapLayerMouseEvent } from "maplibre-gl";
import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";

interface UseMapInteractionProps {
  layers: string[];
  onSelectFeatures: (features: Feature[]) => void;
  enabled?: boolean;
}

export function useMapInteraction({
  layers,
  onSelectFeatures,
  enabled = true,
}: UseMapInteractionProps) {
  const { current: mapRef } = useMap();

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map || !enabled) return;

    const handleMouseEnter = () => {
      if (!map) return;
      const canvas = map.getCanvas();
      if (canvas) canvas.style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      if (!map) return;
      const canvas = map.getCanvas();
      if (canvas) canvas.style.cursor = "";
    };

    const handleMapClick = async (e: MapLayerMouseEvent) => {
      if (!map) return;
      const activeLayers = layers.filter((l) => map.getLayer(l));

      // Find features from our target layers
      const interactiveFeatures = map.queryRenderedFeatures(e.point, {
        layers: activeLayers,
      });
      onSelectFeatures(
        interactiveFeatures.length > 0 ? interactiveFeatures : [],
      );
    };

    const cleanup = () => {
      if (!map) return;
      map.off("click", handleMapClick);
      for (const layerId of layers) {
        if (map.getLayer(layerId)) {
          map.off("mouseenter", layerId, handleMouseEnter);
          map.off("mouseleave", layerId, handleMouseLeave);
        }
      }
    };

    const setupHandlers = () => {
      if (!map) return;
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
      if (map) {
        cleanup();
        map.off("styledata", setupHandlers);
      }
    };
  }, [mapRef, layers, onSelectFeatures, enabled]);
}
