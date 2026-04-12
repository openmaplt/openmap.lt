"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowLeftSquare,
  ArrowRight,
  ArrowRightSquare,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  Info,
  MapPin,
  Navigation,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { RouteInstruction } from "@/hooks/use-route";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import {
  useMapActions,
  useMapConfig,
  useMapSelection,
} from "@/providers/MapProvider";
import { RoutingInputs } from "./RoutingInputs";

interface RouteDetailsProps {
  distance: number | null;
  time: number | null;
  instructions: RouteInstruction[];
  loading: boolean;
  error: string | null;
  routeLine: any | null;
}

export function RouteDetails({
  distance,
  time,
  instructions,
  loading,
  error,
  routeLine,
}: RouteDetailsProps) {
  const isMobile = useIsMobile();
  const { routingMode, selectedRouteProfile } = useMapConfig();
  const { routeStart, routeEnd } = useMapSelection();
  const {
    setRouteStart,
    setRouteEnd,
    setRoutingMode,
    mapRef,
    setHighlightedRoutePoint,
  } = useMapActions();

  const open = routingMode;

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setRouteStart(null);
      setRouteEnd(null);
      setRoutingMode(false);
      setHighlightedRoutePoint(null);
    }
  };

  const handleInstructionClick = (step: RouteInstruction) => {
    if (!routeLine || !mapRef.current) return;

    const startIndex = step.interval[0];
    const coords = routeLine.geometry.coordinates[startIndex];

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

  const getActionWord = () => {
    switch (selectedRouteProfile) {
      case "kayak":
        return "Plaukti";
      case "bike":
        return "Minat";
      case "foot":
        return "Eiti";
      default:
        return "Važiuoti";
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
        return <MapPin className="w-5 h-5 text-red-600" />;
      case 5:
        return <MapPin className="w-5 h-5 text-yellow-600" />;
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

  const formatTime = (ms: number) => {
    const minutes = Math.round(ms / 60000);
    if (minutes < 1) {
      return null;
    }
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h} val. ${m > 0 ? `${m} min` : ""}`;
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange} modal={false}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        className="w-full md:w-96 shadow-xl z-20 !p-0 flex flex-col bg-white"
        style={{ height: isMobile ? "50vh" : "100vh" }}
        preventOutsideClose={true}
        aria-describedby={undefined}
      >
        <SheetHeader className="p-4 border-b border-gray-100 flex flex-col gap-4 bg-white sticky top-0 z-30 shrink-0">
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
            <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
              <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex gap-2 items-center shadow-sm border border-blue-100/50">
                <span className="text-base">
                  {selectedRouteProfile === "bike"
                    ? "🚲"
                    : selectedRouteProfile === "car"
                      ? "🚗"
                      : selectedRouteProfile === "foot"
                        ? "🚶"
                        : selectedRouteProfile === "kayak"
                          ? "🛶"
                          : "🧭"}
                </span>
                {formatDistance(distance)}
              </span>
              <span className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg flex gap-2 items-center shadow-sm border border-gray-100">
                <span>⏱️</span> {formatTime(time) || "1 min"}
              </span>
            </div>
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

          {!loading && !error && distance !== null && (
            <div className="flex flex-col gap-0 pb-10">
              <div
                className="flex gap-4 py-4 px-4 border-b border-gray-50 items-start bg-blue-50/10 hover:bg-blue-50/30 cursor-pointer transition-colors"
                onClick={() => handleStartEndClick("start")}
              >
                <div className="mt-1 bg-green-100 p-2 rounded-full border border-green-200">
                  <MapPin className="w-4 h-4 text-green-700" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-0.5">
                    PRADŽIA
                  </p>
                  <p className="text-[15px] font-bold text-gray-900 leading-tight">
                    {routeStart?.properties?.name || "Pasirinkta vieta"}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-[35px] top-6 bottom-6 w-0.5 bg-gray-100" />

                {instructions
                  .filter((step) => step.sign !== 4)
                  .map((step, idx) => {
                    const isObstacle = !!step.waterway_obstacle;
                    const isMilestoneOnly =
                      step.waterway_milestone_value != null &&
                      !isObstacle &&
                      step.distance === 0;

                    return (
                      <div
                        key={`${idx}-${step.text.substring(0, 10)}`}
                        className={cn(
                          "group relative flex gap-6 py-4 px-4 border-b border-gray-50 last:border-b-0 items-start hover:bg-gray-50/80 cursor-pointer transition-all active:scale-[0.99]",
                          isObstacle && "bg-amber-50/20 hover:bg-amber-50/40",
                        )}
                        onClick={() => handleInstructionClick(step)}
                      >
                        <div className="relative z-10 flex items-center justify-center w-10 shrink-0">
                          <div
                            className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 transition-transform group-hover:scale-110",
                              isObstacle
                                ? "border-amber-400 text-amber-600 shadow-sm"
                                : "border-blue-400 text-blue-600 shadow-sm",
                            )}
                          >
                            {isObstacle ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : isMilestoneOnly ? (
                              <Info className="w-4 h-4 text-blue-500" />
                            ) : (
                              getIconForSign(step.sign)
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-1">
                            {isObstacle && (
                              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">
                                Kliūtis
                              </span>
                            )}
                            {isMilestoneOnly && (
                              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-0.5">
                                Informacija
                              </span>
                            )}

                            <p
                              className={cn(
                                "text-[15px] font-bold leading-snug tracking-tight",
                                isObstacle ? "text-amber-900" : "text-gray-900",
                              )}
                            >
                              {step.text}
                            </p>

                            {step.waterway_milestone_value != null && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase mt-0.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
                                <span>
                                  Atstumo žymeklis:{" "}
                                  {Number(
                                    step.waterway_milestone_value,
                                  ).toFixed(1)}{" "}
                                  km
                                </span>
                              </div>
                            )}

                            {step.waterway_obstacle && (
                              <div className="mt-2 p-2.5 bg-white/80 rounded-lg border border-amber-200/50 shadow-sm">
                                <p className="text-[11px] font-black text-amber-800 flex items-center gap-1.5 mb-1 opacity-80 uppercase tracking-wider">
                                  {step.waterway_obstacle === "dam"
                                    ? "🌊 UŽTVANKA"
                                    : "🌉 TILTAS"}
                                </p>
                                {step.waterway_obstacle_description && (
                                  <p className="text-xs text-amber-700/90 leading-relaxed font-medium">
                                    {step.waterway_obstacle_description}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {formatTime(step.time) && (
                            <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-3">
                              <span className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 uppercase">
                                  {getActionWord()}
                                </span>
                                <span className="font-bold text-gray-700">
                                  {formatDistance(step.distance)}
                                </span>
                              </span>
                              <span className="flex items-center gap-1 text-gray-500">
                                <span className="opacity-60">⏱️</span>
                                <span className="font-medium">
                                  {formatTime(step.time)}
                                </span>
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div
                className="flex gap-4 py-4 px-4 border-t border-gray-100 items-start bg-red-50/10 hover:bg-red-50/30 cursor-pointer transition-colors"
                onClick={() => handleStartEndClick("end")}
              >
                <div className="mt-1 bg-red-100 p-2 rounded-full border border-red-200">
                  <MapPin className="w-4 h-4 text-red-700" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-0.5">
                    PABAIGA
                  </p>
                  <p className="text-[15px] font-bold text-gray-900 leading-tight">
                    {routeEnd?.properties?.name || "Pasirinkta vieta"}
                  </p>
                </div>
              </div>
            </div>
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
