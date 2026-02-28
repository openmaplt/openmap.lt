"use client";

import { useEffect, useState } from "react";
import { ProtectedFilter } from "@/components/ProtectedFilter";
import { type FilterItem, PROTECTED_FILTERS } from "@/config/protected-filters";
import { useMapActions } from "@/providers/MapProvider";

export function ProtectedFeature() {
  const { mapRef } = useMapActions();
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    PROTECTED_FILTERS.map((f: FilterItem) => f.id),
  );

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const updateLayerVisibility = () => {
      PROTECTED_FILTERS.forEach((filter: FilterItem) => {
        const isVisible = selectedTypes.includes(filter.id);
        filter.layers.forEach((layerId: string) => {
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

    map.on("styledata", updateLayerVisibility);
    updateLayerVisibility();

    return () => {
      map.off("styledata", updateLayerVisibility);
    };
  }, [selectedTypes, mapRef]);

  return (
    <ProtectedFilter
      selectedTypes={selectedTypes}
      onTypesChange={setSelectedTypes}
    />
  );
}
