"use client";

import type { Feature } from "geojson";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { DEFAULT_ICON, PLACE_ICONS } from "@/config/places-icons";
import { useSearch } from "@/hooks/use-search";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

interface SearchBoxProps {
  mapCenter: { lat: number; lng: number };
  onSelectResult: (feature: Feature) => void;
  mobileActiveMode: "search" | "filter" | null;
  setMobileActiveMode: (mode: "search" | "filter" | null) => void;
}

export function SearchBox({
  mapCenter,
  onSelectResult,
  mobileActiveMode,
  setMobileActiveMode,
}: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, loading } = useSearch(query, mapCenter);

  const isMobile = useIsMobile();

  const handleSelect = (feature: Feature) => {
    onSelectResult(feature);
    setIsOpen(false);
    setQuery("");
    setMobileActiveMode(null);
  };

  const getIcon = (type: string) => {
    return PLACE_ICONS[type] || DEFAULT_ICON;
  };

  // Handle click outside to collapse search on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setMobileActiveMode(null);
        setIsOpen(false);
        if (isMobile) {
          setQuery("");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setMobileActiveMode, isMobile]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute top-3 left-3 z-10 font-sans transition-all duration-300 ease-in-out search-container w-auto md:w-96",
        mobileActiveMode === "search" && "w-[calc(100%-80px)]",
      )}
    >
      {isMobile && mobileActiveMode !== "search" ? (
        <Button
          size="icon"
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-300 transition-transform hover:scale-105 active:scale-95"
          onClick={() => setMobileActiveMode("search")}
        >
          <Search className="size-4 text-black" />
        </Button>
      ) : (
        <InputGroup className="shadow-lg bg-background">
          <InputGroupInput
            placeholder="Ieškoti vietų..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          {query.length > 0 && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton onClick={() => setQuery("")}>
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      )}

      {(isOpen || query.length >= 3) && (
        <div className="mt-2 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <ul className="py-1 text-sm text-gray-700">
            {results.length > 0 ? (
              results.map((feature) => {
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
              })
            ) : (
              <li className="py-2 hover:bg-gray-100 cursor-pointer text-center text-muted-foreground border-b last:border-b-0 border-gray-100">
                {loading ? "Ieškoma..." : "Nieko nerasta"}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
