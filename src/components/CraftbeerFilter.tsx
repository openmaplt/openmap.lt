"use client";

import { useState } from "react";

type CraftbeerFilterProps = {
  onFilterChange?: (filters: Record<string, boolean>) => void;
};

export function CraftbeerFilter({ onFilterChange }: CraftbeerFilterProps) {
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

  // map filter logic moved to CraftbeerFeature; this component only manages menu state

  const handleBeerTypeChange = (type: string) => {
    const newBeerTypes = { ...beerTypes, [type]: !beerTypes[type] };
    setBeerTypes(newBeerTypes);
    const allFilters = { ...newBeerTypes, [condition]: true, ...venue };
    onFilterChange?.(allFilters);
  };

  const handleCondChange = (cond: "any" | "all") => {
    setCondition(cond);
    const allFilters = { ...beerTypes, [cond]: true, ...venue };
    setCondition(cond);
    onFilterChange?.(allFilters);
  };

  const handleVenueChange = (venueType: string) => {
    const newVenue = { ...venue, [venueType]: !venue[venueType] };
    setVenue(newVenue);
    const allFilters = { ...beerTypes, [condition]: true, ...newVenue };
    onFilterChange?.(allFilters);
  };

  return (
    <div className="absolute top-3 right-3">
      {/* Scoped craftbeer-specific styles */}
      <style>{`
        .menu {
          font: 11px/18px 'Helvetica Neue', Arial, Helvetica, sans-serif;
          font-weight: 550;
          color: #fff;
          background: transparent;
          display: flex;
          flex-direction: column;
          position: absolute;
          top: 7px;
          right: 7px;
          padding: 4px;
          width: 120px;
          transition: right 0.5s;
        }
        .menu input[type="checkbox"] {
          display: none;
        }
        .menu input[type="checkbox"] + label {
          background-color: #333333;
          display: block;
          cursor: pointer;
          padding: 7px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.25);
          margin-bottom: 0px;
          text-transform: capitalize;
        }
        .menu input[type="checkbox"]:checked + label {
          background-color: #fff480;
          color: #000;
        }
        .menu input[type="checkbox"]:checked + label:before {
          content: '✔';
          margin-right: 5px;
        }
        .menu2 {
          display: flex;
          flex-direction: row;
        }
        .menu2 input[type=checkbox] + label {
          width: 56px;
        }
        .menu-control {
          font: 11px/18px 'Helvetica Neue', Arial, Helvetica, sans-serif;
          font-weight: 700;
          background-color: #fff480;
          color: #000;
          position: absolute;
          right: 11px;
          top: 285px;
          width: 112px;
          height: 32px;
          border-radius: 7px;
          padding: 7px;
          cursor: pointer;
          transition: top 0.5s;
        }
        .menu-control-top {
          top: 7px;
          transition: top 0.5s;
        }
        .menu-hidden {
          right: -200px;
          transition: right 0.5s;
        }`}</style>

      <div
        id="menu"
        className={`menu rounded-lg bg-white shadow-lg overflow-hidden ${!isVisible ? "menu-hidden" : ""}`}
      >
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
            <span>Lageris</span>
          </label>
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
            <span>Išsinešti</span>
          </label>
        </div>
      </div>

      {/* Hide/Show Control */}
      <div
        id="menu-control"
        className={`menu-control mt-2 bg-white px-4 py-2 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow text-center text-sm font-medium text-gray-700 ${!isVisible ? "menu-control-top" : ""}`}
        onClick={() => setIsVisible((v) => !v)}
      >
        {!isVisible ? "Rodyti meniu" : "Slėpti meniu"}
      </div>
    </div>
  );
}
