"use client";

import {
  ArrowLeft,
  ArrowLeftSquare,
  ArrowRight,
  ArrowRightSquare,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  MapPin,
  Navigation,
  RefreshCw,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { RouteInstruction } from "@/hooks/use-route";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  useMapActions,
  useMapConfig,
  useMapSelection,
} from "@/providers/MapProvider";
import { VehicleSelector } from "./VehicleSelector";

interface RouteDetailsProps {
  distance: number | null;
  time: number | null;
  instructions: RouteInstruction[];
  loading: boolean;
  error: string | null;
}

export function RouteDetails({
  distance,
  time,
  instructions,
  loading,
  error,
}: RouteDetailsProps) {
  const isMobile = useIsMobile();
  const { routingMode, selectedVehicle } = useMapConfig();
  const { routeStart, routeEnd } = useMapSelection();
  const { setRouteStart, setRouteEnd, setRoutingMode } = useMapActions();

  // If we have distance and time, we want to show the sheet (unless error/loading)
  // Or, we might want to toggle it manually. Let's make it always open while routing is active and we have results.
  const open = routingMode && !loading && !error && instructions.length > 0;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setRouteStart(null);
      setRouteEnd(null);
      setRoutingMode(false);
    }
  };

  const getIconForSign = (sign: number) => {
    switch (sign) {
      case -3:
        return <ArrowLeftSquare className="w-5 h-5 text-blue-600" />;
      case -2:
        return <ArrowLeft className="w-5 h-5 text-blue-600" />;
      case -1:
        return <ArrowUpLeft className="w-5 h-5 text-blue-600" />;
      case 0:
        return <ArrowUp className="w-5 h-5 text-blue-600" />;
      case 1:
        return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
      case 2:
        return <ArrowRight className="w-5 h-5 text-blue-600" />;
      case 3:
        return <ArrowRightSquare className="w-5 h-5 text-blue-600" />;
      case 4:
        return <MapPin className="w-5 h-5 text-red-600" />; // Finish
      case 5:
        return <MapPin className="w-5 h-5 text-yellow-600" />; // Via reached
      case 6:
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      case 7:
        return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
      case 8:
        return <ArrowUpLeft className="w-5 h-5 text-blue-600" />;
      default:
        return <Navigation className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDistance = (dist: number) => {
    if (dist < 1000) {
      return `${Math.round(dist)} m`;
    }
    return `${(dist / 1000).toFixed(1)} km`;
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange} modal={false}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        className="overflow-y-auto w-full md:w-96 shadow-xl z-10 !p-0"
        style={{ height: isMobile ? "50vh" : "auto" }}
        preventOutsideClose={true}
        aria-describedby={undefined}
      >
        <SheetHeader className="p-4 pr-12 border-b border-gray-100 flex flex-col gap-2">
          <SheetTitle className="text-xl font-bold text-left">
            Maršruto detalės
          </SheetTitle>
          {distance !== null && time !== null && (
            <div className="flex flex-col gap-3 mt-1 px-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full flex gap-1 items-center">
                  <span>
                    {selectedVehicle === "bike"
                      ? "🚲"
                      : selectedVehicle === "car"
                        ? "🚗"
                        : selectedVehicle === "foot"
                          ? "🚶"
                          : selectedVehicle === "river"
                            ? "⛵"
                            : "🧭"}
                  </span>{" "}
                  {formatDistance(distance)}
                </span>
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full flex gap-1 items-center">
                  <span>⏱️</span> {Math.round(time / 60000)} min
                </span>
              </div>
              <VehicleSelector className="w-full" />
            </div>
          )}
        </SheetHeader>

        <div className="flex flex-col gap-0 pb-10">
          {/* Explicit Start Point Indicator */}
          <div className="flex gap-4 py-4 px-4 border-b border-gray-100 items-start bg-blue-50/30">
            <div className="mt-1 bg-green-100 p-2 rounded-full border border-green-200">
              <MapPin className="w-5 h-5 text-green-700" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-0.5">
                Pradžia
              </p>
              <p className="text-sm font-semibold text-gray-900 leading-snug">
                {routeStart?.properties?.name || "Pasirinktas pradžios taškas"}
              </p>
            </div>
          </div>

          {instructions
            .filter((step) => step.sign !== 4)
            .map((step, idx) => (
              <div
                key={`${idx}-${step.text.substring(0, 10)}`}
                className="flex gap-4 py-3 px-4 border-b border-gray-100 last:border-b-0 items-start"
              >
                <div className="mt-1 bg-blue-50 p-2 rounded-full border border-blue-100">
                  {getIconForSign(step.sign)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">
                    {step.text}
                  </p>
                  {step.distance > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Važiuoti {formatDistance(step.distance)}
                    </p>
                  )}
                </div>
              </div>
            ))}

          {/* Explicit End Point Indicator */}
          <div className="flex gap-4 py-4 px-4 border-t border-gray-100 items-start bg-red-50/30">
            <div className="mt-1 bg-red-100 p-2 rounded-full border border-red-200">
              <MapPin className="w-5 h-5 text-red-700" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-0.5">
                Pabaiga
              </p>
              <p className="text-sm font-semibold text-gray-900 leading-snug">
                {routeEnd?.properties?.name || "Pasirinktas pabaigos taškas"}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
