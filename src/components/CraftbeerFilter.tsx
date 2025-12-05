"use client";

import { useState, useCallback, useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";
import type { FilterSpecification } from "maplibre-gl";

type CraftbeerFilterProps = {
  onFilterChange?: (filters: Record<string, boolean>) => void;
};

export function CraftbeerFilter({ onFilterChange }: CraftbeerFilterProps) {
  const { current: mapRef } = useMap();

  const [beerTypes, setBeerTypes] = useState<Record<string, boolean>>({
    lager: true,
    ale: true,
    wheat: true,
    stout: true,
    ipa: true,
  });

  const [condition, setCondition] = useState<"any" | "all">("any");

  const [venue, setVenue] = useState<Record<string, boolean>>({
    drink: true,
    shop: false,
  });

  const [isVisible, setIsVisible] = useState(true);

  const applyMapFilter = useCallback(
    (
      bTypes: Record<string, boolean>,
      cond: "any" | "all",
      ven: Record<string, boolean>,
    ) => {
      const map = mapRef?.getMap();
      if (!map) return;

      // Build beer type filters
      const beerFiltersArray: FilterSpecification[] = [];

      if (bTypes.lager) {
        beerFiltersArray.push(["==", "style_lager", "y"]);
      }
      if (bTypes.ale) {
        beerFiltersArray.push(["==", "style_ale", "y"]);
      }
      if (bTypes.wheat) {
        beerFiltersArray.push(["==", "style_wheat", "y"]);
      }
      if (bTypes.stout) {
        beerFiltersArray.push(["==", "style_stout", "y"]);
      }
      if (bTypes.ipa) {
        beerFiltersArray.push(["==", "style_ipa", "y"]);
      }

      // Build main filter
      const filterMain: FilterSpecification[] = ["all", ["==", "drink", "y"]] as FilterSpecification[];

      // Replace drink filter with shop filter if needed
      if (ven.shop && !ven.drink) {
        filterMain[1] = ["==", "shop", "y"];
      }

      // Add beer filters if any are selected
      if (beerFiltersArray.length > 0) {
        const beerFilter = (cond === "any"
          ? ["any", ...beerFiltersArray]
          : ["all", ...beerFiltersArray]) as FilterSpecification;
        filterMain.push(beerFilter);
      }

      // Apply filter to the map layer
      if (map.getLayer("label-amenity")) {
        map.setFilter("label-amenity", filterMain as FilterSpecification);
      }
    },
    [mapRef],
  );

  const handleBeerTypeChange = (type: string) => {
    const newBeerTypes = { ...beerTypes, [type]: !beerTypes[type] };
    setBeerTypes(newBeerTypes);
    applyMapFilter(newBeerTypes, condition, venue);
    const allFilters = { ...newBeerTypes, [condition]: true, ...venue };
    onFilterChange?.(allFilters);
  };

  const handleCondChange = (cond: "any" | "all") => {
    setCondition(cond);
    applyMapFilter(beerTypes, cond, venue);
    const allFilters = { ...beerTypes, [cond]: true, ...venue };
    onFilterChange?.(allFilters);
  };

  const handleVenueChange = (venueType: string) => {
    const newVenue = { ...venue, [venueType]: !venue[venueType] };
    setVenue(newVenue);
    applyMapFilter(beerTypes, condition, newVenue);
    const allFilters = { ...beerTypes, [condition]: true, ...newVenue };
    onFilterChange?.(allFilters);
  };

  // Apply initial filter when map loads
  useEffect(() => {
    applyMapFilter(beerTypes, condition, venue);
  }, [applyMapFilter, beerTypes, condition, venue]);

  if (!isVisible) {
    return (
      <div
        className="absolute top-3 right-3 bg-white px-3 py-2 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setIsVisible(true)}
      >
        <div className="text-sm font-medium text-gray-700">Rodyti meniu</div>
      </div>
    );
  }

  return (
    <div className="absolute top-3 right-3">
      <div id="menu" className="menu rounded-lg bg-white shadow-lg overflow-hidden">
        {/* Beer Types */}
        <div>
          <input
            type="checkbox"
            id="label-lager"
            checked={beerTypes.lager}
            onChange={() => handleBeerTypeChange("lager")}
            className="hidden"
          />
          <label
            htmlFor="label-lager"
            className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 border-b border-gray-200 rounded-t-lg"
          >
            <input
              type="checkbox"
              checked={beerTypes.lager}
              onChange={() => handleBeerTypeChange("lager")}
              className="mr-3"
            />
            <span>Lageris</span>
          </label>
        </div>

        <div>
          <input
            type="checkbox"
            id="label-ale"
            checked={beerTypes.ale}
            onChange={() => handleBeerTypeChange("ale")}
            className="hidden"
          />
          <label
            htmlFor="label-ale"
            className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 border-b border-gray-200"
          >
            <input
              type="checkbox"
              checked={beerTypes.ale}
              onChange={() => handleBeerTypeChange("ale")}
              className="mr-3"
            />
            <span>Elis</span>
          </label>
        </div>

        <div>
          <input
            type="checkbox"
            id="label-wheat"
            checked={beerTypes.wheat}
            onChange={() => handleBeerTypeChange("wheat")}
            className="hidden"
          />
          <label
            htmlFor="label-wheat"
            className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 border-b border-gray-200"
          >
            <input
              type="checkbox"
              checked={beerTypes.wheat}
              onChange={() => handleBeerTypeChange("wheat")}
              className="mr-3"
            />
            <span>Kvietinis</span>
          </label>
        </div>

        <div>
          <input
            type="checkbox"
            id="label-stout"
            checked={beerTypes.stout}
            onChange={() => handleBeerTypeChange("stout")}
            className="hidden"
          />
          <label
            htmlFor="label-stout"
            className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 border-b border-gray-200"
          >
            <input
              type="checkbox"
              checked={beerTypes.stout}
              onChange={() => handleBeerTypeChange("stout")}
              className="mr-3"
            />
            <span>Stautas</span>
          </label>
        </div>

        <div>
          <input
            type="checkbox"
            id="label-ipa"
            checked={beerTypes.ipa}
            onChange={() => handleBeerTypeChange("ipa")}
            className="hidden"
          />
          <label
            htmlFor="label-ipa"
            className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 border-b border-gray-200 rounded-b-lg"
          >
            <input
              type="checkbox"
              checked={beerTypes.ipa}
              onChange={() => handleBeerTypeChange("ipa")}
              className="mr-3"
            />
            <span>IPA</span>
          </label>
        </div>

        {/* Condition Selector */}
        <div className="flex mt-1 mb-1 bg-gray-100 rounded-lg overflow-hidden">
          <div className="flex-1">
            <input
              type="checkbox"
              id="label-or"
              checked={condition === "any"}
              onChange={() => handleCondChange("any")}
              className="hidden"
            />
            <label
              htmlFor="label-or"
              className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 text-center font-medium text-sm rounded-l-lg border-r border-gray-300"
            >
              <input
                type="checkbox"
                checked={condition === "any"}
                onChange={() => handleCondChange("any")}
                className="mr-2"
              />
              <span>ARBA</span>
            </label>
          </div>
          <div className="flex-1">
            <input
              type="checkbox"
              id="label-and"
              checked={condition === "all"}
              onChange={() => handleCondChange("all")}
              className="hidden"
            />
            <label
              htmlFor="label-and"
              className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 text-center font-medium text-sm rounded-r-lg"
            >
              <input
                type="checkbox"
                checked={condition === "all"}
                onChange={() => handleCondChange("all")}
                className="mr-2"
              />
              <span>IR</span>
            </label>
          </div>
        </div>

        {/* Venue Type */}
        <div>
          <input
            type="checkbox"
            id="label-drink"
            checked={venue.drink}
            onChange={() => handleVenueChange("drink")}
            className="hidden"
          />
          <label
            htmlFor="label-drink"
            className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 border-b border-gray-200 rounded-t-lg"
          >
            <input
              type="checkbox"
              checked={venue.drink}
              onChange={() => handleVenueChange("drink")}
              className="mr-3"
            />
            <span>Gerti</span>
          </label>
        </div>

        <div>
          <input
            type="checkbox"
            id="label-shop"
            checked={venue.shop}
            onChange={() => handleVenueChange("shop")}
            className="hidden"
          />
          <label
            htmlFor="label-shop"
            className="block px-4 py-2 bg-white cursor-pointer hover:bg-gray-50 rounded-b-lg"
          >
            <input
              type="checkbox"
              checked={venue.shop}
              onChange={() => handleVenueChange("shop")}
              className="mr-3"
            />
            <span>Išsinešti</span>
          </label>
        </div>
      </div>

      {/* Hide/Show Control */}
      <div
        id="menu-control"
        className="mt-2 bg-white px-4 py-2 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow text-center text-sm font-medium text-gray-700"
        onClick={() => setIsVisible(false)}
      >
        Slėpti meniu
      </div>
    </div>
  );
}
