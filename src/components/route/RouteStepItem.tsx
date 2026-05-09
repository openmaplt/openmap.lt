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
} from "lucide-react";
import type { RouteProfile } from "@/config/map-profiles";
import { type RouteInstruction, RouteSign } from "@/hooks/use-routing";
import { formatDistance, formatTime } from "@/lib/routeUtils";
import { cn } from "@/lib/utils";

function getIconForSign(sign: RouteSign) {
  switch (sign) {
    case RouteSign.TurnSharpLeft:
      return <ArrowLeftSquare className="w-5 h-5 text-blue-600" />;
    case RouteSign.TurnLeft:
      return <ArrowLeft className="w-5 h-5 text-blue-600" />;
    case RouteSign.TurnSlightLeft:
      return <ArrowUpLeft className="w-5 h-5 text-blue-600" />;
    case RouteSign.ContinueStraight:
      return <ArrowUp className="w-5 h-5 text-blue-600" />;
    case RouteSign.TurnSlightRight:
      return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
    case RouteSign.TurnRight:
      return <ArrowRight className="w-5 h-5 text-blue-600" />;
    case RouteSign.TurnSharpRight:
      return <ArrowRightSquare className="w-5 h-5 text-blue-600" />;
    case RouteSign.Finish:
      return <MapPin className="w-5 h-5 text-red-600" />;
    case RouteSign.ViaPoint:
      return <MapPin className="w-5 h-5 text-yellow-600" />;
    case RouteSign.EnterRoundabout:
      return <RefreshCw className="w-5 h-5 text-blue-600" />;
    case RouteSign.KeepRight:
      return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
    case RouteSign.UTurnRight:
      return <ArrowUpLeft className="w-5 h-5 text-blue-600" />;
    default:
      return <Navigation className="w-5 h-5 text-gray-500" />;
  }
}

interface RouteStepItemProps {
  step: RouteInstruction;
  idx: number;
  actionWord: string;
  selectedRouteProfile: RouteProfile | null;
  onClick: () => void;
}

export function RouteStepItem({
  step,
  idx,
  actionWord,
  selectedRouteProfile,
  onClick,
}: RouteStepItemProps) {
  const isObstacle = !!step.waterway_obstacle;
  const isMilestoneOnly =
    step.waterway_milestone_value != null && !isObstacle && step.distance === 0;

  return (
    <button
      type="button"
      key={`${idx}-${step.text.substring(0, 10)}`}
      className={cn(
        "w-full group relative flex gap-6 py-4 px-4 border-b border-gray-50 last:border-b-0 items-start hover:bg-gray-50/80 cursor-pointer transition-all active:scale-[0.99] text-left",
        isObstacle && "bg-amber-50/20 hover:bg-amber-50/40",
      )}
      onClick={onClick}
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
                {Number(step.waterway_milestone_value).toFixed(1)} km
              </span>
            </div>
          )}

          {step.waterway_obstacle && (
            <div className="mt-2 p-2.5 bg-white/80 rounded-lg border border-amber-200/50 shadow-sm">
              <p className="text-[11px] font-black text-amber-800 flex items-center gap-1.5 mb-1 opacity-80 uppercase tracking-wider">
                {step.waterway_obstacle === "dam" ? "🌊 UŽTVANKA" : "🌉 TILTAS"}
              </p>
              {step.waterway_obstacle_description && (
                <p className="text-xs text-amber-700/90 leading-relaxed font-medium">
                  {step.waterway_obstacle_description}
                </p>
              )}
            </div>
          )}
        </div>

        {!isObstacle && (
          <p className="text-xs text-gray-400 mt-2.5 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 uppercase">
                {actionWord}
              </span>
              <span className="font-bold text-gray-700">
                {formatDistance(step.distance)}
              </span>
            </span>
            {selectedRouteProfile === "kayak" && formatTime(step.time) && (
              <span className="flex items-center gap-1 text-gray-500">
                <span className="opacity-60">⏱️</span>
                <span className="font-medium">{formatTime(step.time)}</span>
              </span>
            )}
          </p>
        )}
      </div>
    </button>
  );
}
