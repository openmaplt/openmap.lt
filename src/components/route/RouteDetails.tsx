"use client";

import type { Feature, LineString } from "geojson";
import { AlertTriangle, Navigation, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { RouteInstruction } from "@/hooks/use-routing";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMapActions } from "@/providers/MapProvider";
import { useRoute } from "@/providers/RouteProvider";
import { RouteStats } from "./RouteStats";
import { RouteStepsList } from "./RouteStepsList";
import { RoutingInputs } from "./RoutingInputs";

interface RouteProgressInfo {
  remainingDistance: number | null;
  remainingTime: number | null;
  error: GeolocationPositionError | null;
}

interface RouteDetailsProps {
  distance: number | null;
  time: number | null;
  instructions: RouteInstruction[];
  loading: boolean;
  error: string | null;
  routeLine: Feature<LineString> | null;
  progress: RouteProgressInfo;
}

export function RouteDetails({
  distance,
  time,
  instructions,
  loading,
  error,
  routeLine,
  progress,
}: RouteDetailsProps) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    routingMode,
    navigationMode,
    selectedRouteProfile,
    routeStart,
    routeEnd,
    setRouteStart,
    setRouteEnd,
    setRoutingMode,
    setNavigationMode,
    setHighlightedRoutePoint,
  } = useRoute();
  const { mapRef } = useMapActions();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setIsExpanded(false);
      setRouteStart(null);
      setRouteEnd(null);
      setRoutingMode(false);
      setNavigationMode(false);
      setHighlightedRoutePoint(null);
    }
  };

  const handleInstructionClick = (step: RouteInstruction) => {
    if (!routeLine || !mapRef.current) return;
    const coords = routeLine.geometry.coordinates[step.interval[0]];
    if (coords) {
      setHighlightedRoutePoint([coords[0], coords[1]]);
      mapRef.current.flyTo({
        center: [coords[0], coords[1]],
        zoom: 17,
        padding: isMobile ? { bottom: 300 } : { left: 400 },
        duration: 1500,
      });
    }
  };

  const handleStartEndClick = (type: "start" | "end") => {
    if (!routeLine || !mapRef.current) return;
    const coords =
      type === "start"
        ? routeLine.geometry.coordinates[0]
        : routeLine.geometry.coordinates[
            routeLine.geometry.coordinates.length - 1
          ];
    if (coords) {
      setHighlightedRoutePoint([coords[0], coords[1]]);
      mapRef.current.flyTo({
        center: [coords[0], coords[1]],
        zoom: 17,
        padding: isMobile ? { bottom: 300 } : { left: 400 },
        duration: 1500,
      });
    }
  };

  return (
    <Sheet open={routingMode} onOpenChange={handleOpenChange} modal={false}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        className="w-full md:w-96 shadow-xl z-20 !p-0 !gap-0 flex flex-col bg-white"
        style={{
          height: isMobile ? (isExpanded ? "95dvh" : "50dvh") : "100vh",
          transition: "height 0.3s ease",
        }}
        preventOutsideClose={true}
        hideCloseButton={true}
        aria-describedby={undefined}
      >
        {isMobile && (
          <button
            type="button"
            className="flex items-center justify-center w-full pt-2 pb-1 shrink-0"
            onClick={() => setIsExpanded((v) => !v)}
          >
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </button>
        )}
        <SheetHeader className="px-4 pt-2 pb-4 border-b border-gray-100 flex flex-col gap-3 bg-white sticky top-0 z-30 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold text-left flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" /> Maršrutas
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-900"
              onClick={() => handleOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <RoutingInputs />

          {distance !== null && time !== null && (
            <>
              <RouteStats
                distance={distance}
                time={time}
                routeLine={routeLine}
                instructions={instructions}
                selectedRouteProfile={selectedRouteProfile}
                navigationMode={navigationMode}
                remainingDistance={progress.remainingDistance}
                remainingTime={progress.remainingTime}
              />
              <Button
                variant={navigationMode ? "outline" : "default"}
                className="w-full"
                onClick={() => setNavigationMode(!navigationMode)}
              >
                <Navigation className="w-4 h-4" />
                {navigationMode ? "Baigti navigaciją" : "Pradėti navigaciją"}
              </Button>
              {navigationMode && progress.error && (
                <p className="text-xs text-red-600 font-sans">
                  Nepavyko nustatyti jūsų pozicijos. Patikrinkite vietos
                  nustatymo leidimus.
                </p>
              )}
            </>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center gap-4">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-gray-500 font-sans">
                Ieškomas geriausias maršrutas...
              </p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900 font-sans">
                  Maršruto klaida
                </p>
                <p className="text-xs text-gray-500 leading-relaxed font-sans">
                  {error}
                </p>
              </div>
            </div>
          )}

          {!loading && !error && distance !== null && routeLine && (
            <RouteStepsList
              instructions={instructions}
              routeStartName={routeStart?.properties?.name}
              routeEndName={routeEnd?.properties?.name}
              selectedRouteProfile={selectedRouteProfile}
              onInstructionClick={handleInstructionClick}
              onStartEndClick={handleStartEndClick}
            />
          )}

          {!loading && !error && distance === null && (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center gap-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Navigation className="w-8 h-8 text-blue-200 rotate-45" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900 font-sans">
                  Pasirinkite maršrutą
                </p>
                <p className="text-xs text-gray-400 leading-relaxed font-sans">
                  Nurodykite pradžios ir pabaigos taškus laukeliuose viršuje
                </p>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
