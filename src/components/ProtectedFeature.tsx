"use client";

import type { Feature } from "geojson";
import type { MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import { ProtectedFilter } from "@/components/ProtectedFilter";
import {
  PROTECTED_ACTIVE_LAYERS,
  PROTECTED_FILTERS,
} from "@/config/protected-filters";

interface ProtectedFeatureProps {
  onSelectFeature: (feature: Feature | null) => void;
}

export function ProtectedFeature({ onSelectFeature }: ProtectedFeatureProps) {
  const { current: mapRef } = useMap();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    PROTECTED_FILTERS.map((f) => f.id),
  );

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const updateLayerVisibility = () => {
      PROTECTED_FILTERS.forEach((filter) => {
        const isVisible = selectedTypes.includes(filter.id);
        filter.layers.forEach((layerId) => {
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(
              layerId,
              "visibility",
              isVisible ? "visible" : "none",
            );
          }
        });
      });
    };

    map.on("load", updateLayerVisibility);
    updateLayerVisibility();

    return () => {
      map.off("load", updateLayerVisibility);
    };
  }, [selectedTypes, mapRef]);

  // Handle map events for protected layers
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const onLayerClick = (e: MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        console.log("Clicked feature properties:", feature.properties);
        onSelectFeature(feature as Feature);
      }
    };

    const onMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const onMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    // Deselect feature when clicking on the map
    const onMapClick = (e: MapLayerMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: PROTECTED_ACTIVE_LAYERS,
      });
      if (features.length === 0) {
        onSelectFeature(null);
      }
    };

    const setupEventHandlers = () => {
      map.on("click", onMapClick);
      PROTECTED_ACTIVE_LAYERS.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.on("click", layerId, onLayerClick);
          map.on("mouseenter", layerId, onMouseEnter);
          map.on("mouseleave", layerId, onMouseLeave);
        }
      });
    };

    if (map.isStyleLoaded()) {
      setupEventHandlers();
    } else {
      map.on("load", setupEventHandlers);
    }

    return () => {
      map.off("click", onMapClick);
      PROTECTED_ACTIVE_LAYERS.forEach((layerId) => {
        if (map.getStyle() && map.getLayer(layerId)) {
          map.off("click", layerId, onLayerClick);
          map.off("mouseenter", layerId, onMouseEnter);
          map.off("mouseleave", layerId, onMouseLeave);
        }
      });
      map.off("load", setupEventHandlers);
    };
  }, [mapRef, onSelectFeature]);

  return (
    <ProtectedFilter
      selectedTypes={selectedTypes}
      onTypesChange={setSelectedTypes}
      mobileActiveMode={null}
      setMobileActiveMode={() => {}}
    />
  );
}
