"use client";

import type { Feature } from "geojson";
import { ArrowLeftRight, Navigation, X } from "lucide-react";
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
import {
  useMapActions,
  useMapConfig,
  useMapSelection,
  useMapTransform,
} from "@/providers/MapProvider";
import { VehicleSelector } from "./VehicleSelector";

export function RoutingUI() {
  const { viewState } = useMapTransform();
  const { mobileActiveMode, routingMode, activeMapProfile } = useMapConfig();
  const { setMobileActiveMode, setRoutingMode, setRouteStart, setRouteEnd } =
    useMapActions();
  const { routeStart, routeEnd } = useMapSelection();

  const mapCenter = {
    lat: viewState?.latitude || 0,
    lng: viewState?.longitude || 0,
  };
  const mapType = activeMapProfile.mapType;

  const [startQuery, setStartQuery] = useState("");
  const [endQuery, setEndQuery] = useState("");
  const [activeInput, setActiveInput] = useState<"start" | "end" | null>(null);

  const { results: startResults, loading: startLoading } = useSearch(
    startQuery,
    mapCenter,
    mapType,
  );
  const { results: endResults, loading: endLoading } = useSearch(
    endQuery,
    mapCenter,
    mapType,
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Populate input text based on selected feature
  useEffect(() => {
    if (routeStart) {
      setStartQuery(routeStart.properties?.name || "Pasirinkta vieta");
    }
  }, [routeStart]);

  useEffect(() => {
    if (routeEnd) {
      setEndQuery(routeEnd.properties?.name || "Pasirinkta vieta");
    }
  }, [routeEnd]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setActiveInput(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (feature: Feature, type: "start" | "end") => {
    if (type === "start") {
      setRouteStart(feature);
      setActiveInput(null);
    } else {
      setRouteEnd(feature);
      setActiveInput(null);
    }
  };

  const swapEndpoints = () => {
    const tempStart = routeStart;
    const tempEnd = routeEnd;
    const tempStartQuery = startQuery;
    const tempEndQuery = endQuery;

    setRouteStart(tempEnd);
    setRouteEnd(tempStart);
    setStartQuery(tempEndQuery);
    setEndQuery(tempStartQuery);
  };

  const closeRouting = () => {
    setRoutingMode(false);
    setMobileActiveMode(null);
    setRouteStart(null);
    setRouteEnd(null);
    setStartQuery("");
    setEndQuery("");
  };

  const getIcon = (type: string) => {
    return PLACE_ICONS[type] || DEFAULT_ICON;
  };

  if (!routingMode) return null;

  const renderResults = (type: "start" | "end") => {
    const results = type === "start" ? startResults : endResults;
    const loading = type === "start" ? startLoading : endLoading;
    const query = type === "start" ? startQuery : endQuery;

    // Only show autocomplete if user is typing (active input matches and user isn't just looking at the populated search text)
    const isEditing =
      activeInput === type &&
      ((type === "start" && !routeStart) ||
        (type === "end" && !routeEnd) ||
        (type === "start" && startQuery !== routeStart?.properties?.name) ||
        (type === "end" && endQuery !== routeEnd?.properties?.name));

    if (!isEditing || query.length < 3) return null;

    return (
      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 z-20">
        <ul className="py-1 text-sm text-gray-700">
          {results.length > 0 ? (
            results.map((feature) => {
              const props = feature.properties || {};
              const iconConfig = getIcon(props.TYPE);
              const Icon = iconConfig.icon;
              const dist = props.DIST ? (props.DIST / 1000).toFixed(2) : null;

              return (
                <li
                  key={feature.id}
                  className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-start gap-3 border-b last:border-b-0 border-gray-100"
                  onClick={() => handleSelect(feature, type)}
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
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute top-3 left-3 z-10 font-sans transition-all duration-300 ease-in-out bg-white p-3 rounded-xl shadow-lg border border-gray-200 w-auto md:w-[400px]",
        (mobileActiveMode === "routing" || mobileActiveMode === "search") &&
          "w-[calc(100%-24px)]",
      )}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-blue-600" /> Maršrutas
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={closeRouting}
          className="h-8 w-8 text-gray-500 hover:text-gray-800"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <VehicleSelector className="mb-4 px-1" />

      <div className="flex gap-2 relative">
        <div className="flex flex-col gap-2 flex-1 relative">
          <div className="relative">
            <InputGroup className="bg-gray-50 border-gray-200">
              <InputGroupInput
                placeholder="Pradžios taškas"
                value={startQuery}
                onChange={(e) => {
                  setStartQuery(e.target.value);
                  if (routeStart) setRouteStart(null); // Clear start feature if user modifies input
                }}
                onFocus={() => setActiveInput("start")}
              />
              {startQuery && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    onClick={() => {
                      setStartQuery("");
                      setRouteStart(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
            {renderResults("start")}
          </div>

          <div className="relative">
            <InputGroup className="bg-gray-50 border-gray-200">
              <InputGroupInput
                placeholder="Pabaigos taškas"
                value={endQuery}
                onChange={(e) => {
                  setEndQuery(e.target.value);
                  if (routeEnd) setRouteEnd(null);
                }}
                onFocus={() => setActiveInput("end")}
              />
              {endQuery && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    onClick={() => {
                      setEndQuery("");
                      setRouteEnd(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
            {renderResults("end")}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 text-gray-600 hover:text-blue-600 border-gray-200 transition-colors"
            onClick={swapEndpoints}
            title="Sukeisti kryptis"
          >
            <ArrowLeftRight className="h-4 w-4 rotate-90" />
          </Button>
        </div>
      </div>
    </div>
  );
}
