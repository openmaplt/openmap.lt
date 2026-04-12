"use client";

import type { Feature } from "geojson";
import { ArrowLeftRight, X } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  useMapActions,
  useMapConfig,
  useMapSelection,
  useMapTransform,
} from "@/providers/MapProvider";
import { VehicleSelector } from "./VehicleSelector";

export function RoutingInputs({ className }: { className?: string }) {
  const { viewState } = useMapTransform();
  const { activeMapProfile } = useMapConfig();
  const { setRouteStart, setRouteEnd } = useMapActions();
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
    } else {
      setStartQuery("");
    }
  }, [routeStart]);

  useEffect(() => {
    if (routeEnd) {
      setEndQuery(routeEnd.properties?.name || "Pasirinkta vieta");
    } else {
      setEndQuery("");
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
    setRouteStart(tempEnd);
    setRouteEnd(tempStart);
  };

  const getIcon = (type: string) => {
    return PLACE_ICONS[type] || DEFAULT_ICON;
  };

  const renderResults = (type: "start" | "end") => {
    const results = type === "start" ? startResults : endResults;
    const loading = type === "start" ? startLoading : endLoading;
    const query = type === "start" ? startQuery : endQuery;

    const isEditing =
      activeInput === type &&
      ((type === "start" && !routeStart) ||
        (type === "end" && !routeEnd) ||
        (type === "start" && startQuery !== routeStart?.properties?.name) ||
        (type === "end" && endQuery !== routeEnd?.properties?.name));

    if (!isEditing || query.length < 3) return null;

    return (
      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-2xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 z-[100] border border-gray-100">
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
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-start gap-3 border-b last:border-b-0 border-gray-50 transition-colors"
                  onClick={() => handleSelect(feature, type)}
                >
                  <div
                    className="p-2 rounded-full shrink-0 shadow-sm"
                    style={{
                      backgroundColor: iconConfig.color,
                      color: "white",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">
                      {props.name || "Be pavadinimo"}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate mt-0.5">
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
                    <div className="text-xs font-medium text-blue-600 whitespace-nowrap bg-blue-50 px-1.5 py-0.5 rounded">
                      {dist} km
                    </div>
                  )}
                </li>
              );
            })
          ) : (
            <li className="py-4 text-center text-gray-400 text-xs italic">
              {loading ? "Ieškoma..." : "Nieko nerasta"}
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={cn("flex flex-col gap-3", className)}>
      <VehicleSelector className="w-full" />

      <div className="flex gap-2 relative">
        <div className="flex flex-col gap-2 flex-1 relative">
          <div className="relative">
            <InputGroup className="bg-gray-50/80 border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all rounded-lg">
              <InputGroupAddon>
                <div className="w-2 h-2 rounded-full bg-green-500 ml-1" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Iš kur..."
                value={startQuery}
                className="bg-transparent border-none focus-visible:ring-0 text-sm font-medium"
                onChange={(e) => {
                  setStartQuery(e.target.value);
                  if (routeStart) setRouteStart(null);
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
                    <X className="w-3.5 h-3.5" />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
            {renderResults("start")}
          </div>

          <div className="relative">
            <InputGroup className="bg-gray-50/80 border-gray-200 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all rounded-lg">
              <InputGroupAddon>
                <div className="w-2 h-2 rounded-full bg-red-500 ml-1" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Į kur..."
                value={endQuery}
                className="bg-transparent border-none focus-visible:ring-0 text-sm font-medium"
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
                    <X className="w-3.5 h-3.5" />
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
            className="h-9 w-9 text-gray-400 hover:text-blue-600 border-gray-200 hover:border-blue-200 bg-white shadow-sm transition-all"
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
