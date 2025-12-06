"use client";

import { CraftbeerFilter } from "@/components/CraftbeerFilter";
import { useCallback, useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";
import type { FilterSpecification } from "maplibre-gl";

export function CraftbeerFeature() {
  const { current: mapRef } = useMap();

  const applyMapFilter = useCallback(
    (
      bTypes: Record<string, boolean>,
      cond: "any" | "all",
      ven: Record<string, boolean>,
    ) => {
      const map = mapRef?.getMap();
      if (!map) return;

      const beerFiltersArray: FilterSpecification[] = [];
      if (bTypes.lager) beerFiltersArray.push(["==", "style_lager", "y"]);
      if (bTypes.ale) beerFiltersArray.push(["==", "style_ale", "y"]);
      if (bTypes.wheat) beerFiltersArray.push(["==", "style_wheat", "y"]);
      if (bTypes.stout) beerFiltersArray.push(["==", "style_stout", "y"]);
      if (bTypes.ipa) beerFiltersArray.push(["==", "style_ipa", "y"]);

      const filterMain: FilterSpecification[] = [
        "all",
        ["==", "drink", "y"],
      ] as FilterSpecification[];
      if (ven.shop && !ven.drink) {
        filterMain[1] = ["==", "shop", "y"];
      }

      if (beerFiltersArray.length > 0) {
        const beerFilter = (
          cond === "any"
            ? ["any", ...beerFiltersArray]
            : ["all", ...beerFiltersArray]
        ) as FilterSpecification;
        filterMain.push(beerFilter);
      }

      if (map.getLayer("label-amenity")) {
        map.setFilter("label-amenity", filterMain as FilterSpecification);
      }
    },
    [mapRef],
  );

  const handleFilterChange = (filters: Record<string, boolean>) => {
    // parse incoming filters object from CraftbeerFilter
    const cond: "any" | "all" = filters.any
      ? "any"
      : filters.all
        ? "all"
        : "any";
    const ven = { drink: !!filters.drink, shop: !!filters.shop };
    const bTypes = {
      lager: !!filters.lager,
      ale: !!filters.ale,
      wheat: !!filters.wheat,
      stout: !!filters.stout,
      ipa: !!filters.ipa,
    };
    applyMapFilter(bTypes, cond, ven);
  };

  // Apply default initial filter when component mounts
  useEffect(() => {
    const defaultBT = {
      lager: true,
      ale: true,
      wheat: true,
      stout: true,
      ipa: true,
    };
    const defaultCond: "any" | "all" = "any";
    const defaultVen = { drink: true, shop: false };
    applyMapFilter(defaultBT, defaultCond, defaultVen);
  }, [applyMapFilter]);

  return <CraftbeerFilter onFilterChange={handleFilterChange} />;
}
