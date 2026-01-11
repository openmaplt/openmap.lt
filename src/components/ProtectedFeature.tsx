"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import { ProtectedFilter } from "@/components/ProtectedFilter";
import { PROTECTED_FILTERS } from "@/config/protected-filters";

export function ProtectedFeature() {
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

  return (
    <ProtectedFilter
      selectedTypes={selectedTypes}
      onTypesChange={setSelectedTypes}
      mobileActiveMode={null}
      setMobileActiveMode={() => {}}
    />
  );
}
