"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import { CraftbeerFilter } from "@/components/CraftbeerFilter";
import { beerStyles, type CraftbeerFilters } from "@/config/craftbeer-filters";

export function CraftbeerFeature() {
  const { current: mapRef } = useMap();
  const [filters, setFilters] = useState<CraftbeerFilters>({
    styles: beerStyles.map(({ value }) => value),
    condition: "any",
    venue: "drink",
  });

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const applyFilter = () => {
      if (map.getLayer("label-amenity")) {
        map.setFilter("label-amenity", [
          "all",
          ["==", filters.venue, "y"],
          [
            filters.condition,
            ...filters.styles.map((style) => ["==", `style_${style}`, "y"]),
          ] as any,
        ]);
      }
    };

    applyFilter();
    map.once("styledata", applyFilter);

    return () => {
      map.off("styledata", applyFilter);
    };
  }, [filters, mapRef]);

  return <CraftbeerFilter filters={filters} onFiltersChange={setFilters} />;
}
