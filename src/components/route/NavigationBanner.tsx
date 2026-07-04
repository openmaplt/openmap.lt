"use client";

import { Navigation, PartyPopper, X } from "lucide-react";
import type { RouteInstruction } from "@/hooks/use-routing";
import { formatDistance, formatTime } from "@/lib/routeUtils";
import { getIconComponentForSign } from "./RouteStepItem";

interface NavigationBannerProps {
  activeInstruction: RouteInstruction | null;
  activeDistance: number | null;
  nextInstruction: RouteInstruction | null;
  remainingDistance: number | null;
  remainingTime: number | null;
  arrived: boolean;
  locationError: boolean;
  onStop: () => void;
}

export function NavigationBanner({
  activeInstruction,
  activeDistance,
  nextInstruction,
  remainingDistance,
  remainingTime,
  arrived,
  locationError,
  onStop,
}: NavigationBannerProps) {
  const Icon = activeInstruction
    ? getIconComponentForSign(activeInstruction.sign)
    : Navigation;

  return (
    <>
      <div
        className={`absolute top-3 left-3 right-3 z-30 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 ${arrived ? "bg-green-600" : "bg-blue-600"}`}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/15 shrink-0">
          {arrived ? (
            <PartyPopper className="w-6 h-6 text-white" />
          ) : (
            <Icon className="w-6 h-6 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {arrived ? (
            <p className="text-lg font-black leading-tight">
              Atvykote į kelionės tikslą!
            </p>
          ) : (
            <>
              <p className="text-2xl font-black leading-none">
                {activeDistance != null ? formatDistance(activeDistance) : "--"}
              </p>
              <p className="text-sm font-medium truncate opacity-90 mt-1.5">
                {activeInstruction?.text ?? "Sekite maršrutą"}
              </p>
              {nextInstruction && (
                <p className="text-xs opacity-70 truncate mt-0.5">
                  Tada: {nextInstruction.text}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-30 bg-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-base font-black text-gray-900 whitespace-nowrap">
            {remainingDistance != null
              ? formatDistance(remainingDistance)
              : "--"}
          </span>
          <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
            {(remainingTime != null && formatTime(remainingTime)) || "< 1 min"}
          </span>
          {locationError && (
            <span className="text-xs font-medium text-red-600 truncate">
              Nėra GPS signalo
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onStop}
          className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-bold shrink-0"
        >
          <X className="w-4 h-4" /> Baigti
        </button>
      </div>
    </>
  );
}
