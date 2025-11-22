"use client";

import type { Feature } from "geojson";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_ICON, PLACE_ICONS } from "@/config/places-icons";
import { useSearch } from "@/hooks/use-search";

interface SearchBoxProps {
  mapCenter: { lat: number; lng: number };
  onSelectResult: (feature: Feature) => void;
}

export function SearchBox({ mapCenter, onSelectResult }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { results } = useSearch(query, mapCenter);

  useEffect(() => {
    if (results.length > 0) {
      setIsOpen(true);
    }
  }, [results]);

  const handleSelect = (feature: Feature) => {
    onSelectResult(feature);
    setIsOpen(false);
    setQuery("");
  };

  const getIcon = (type: string) => {
    return PLACE_ICONS[type] || DEFAULT_ICON;
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-80 font-sans">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-500" />
        </div>
        <input
          type="text"
          className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white shadow-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ieškoti vietų..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => {
              setQuery("");
            }}
          >
            <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="mt-2 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto">
          <ul className="py-1 text-sm text-gray-700">
            {results.map((feature) => {
              const props = feature.properties || {};
              const type = props.TYPE;
              const iconConfig = getIcon(type);
              const Icon = iconConfig.icon;
              const dist = props.DIST ? (props.DIST / 1000).toFixed(2) : null;

              return (
                <li
                  key={feature.id}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-start gap-3 border-b last:border-b-0 border-gray-100"
                  onClick={() => handleSelect(feature)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelect(feature);
                    }
                  }}
                >
                  <div
                    className="p-2 rounded-full shrink-0"
                    style={{
                      backgroundColor: iconConfig.color,
                      color: "white",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">
                      {props.name || "Be pavadinimo"}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {[
                        props["addr:street"],
                        props["addr:housenumber"],
                        props["addr:city"],
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </div>
                  {dist && (
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                      {dist} km
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
