"use client";

import { Menu, Navigation, PartyPopper } from "lucide-react";
import type { RouteInstruction } from "@/hooks/use-routing";
import { formatDistance } from "@/lib/routeUtils";
import { getIconComponentForSign } from "./RouteStepItem";

interface NavigationInstructionBannerProps {
  activeInstruction: RouteInstruction | null;
  activeDistance: number | null;
  nextInstruction: RouteInstruction | null;
  arrived: boolean;
  onOpenList: () => void;
}

export function NavigationInstructionBanner({
  activeInstruction,
  activeDistance,
  nextInstruction,
  arrived,
  onOpenList,
}: NavigationInstructionBannerProps) {
  const Icon = activeInstruction
    ? getIconComponentForSign(activeInstruction.sign)
    : Navigation;

  return (
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
      {!arrived && (
        <button
          type="button"
          onClick={onOpenList}
          aria-label="Rodyti visas instrukcijas"
          className="shrink-0 p-2 -mr-1 rounded-full hover:bg-white/10 active:bg-white/20"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}
