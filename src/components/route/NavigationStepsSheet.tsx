"use client";

import { X } from "lucide-react";
import type { RouteProfile } from "@/config/map-profiles";
import type { RouteInstruction } from "@/hooks/use-routing";
import { RouteStepsList } from "./RouteStepsList";

interface NavigationStepsSheetProps {
  instructions: RouteInstruction[];
  routeStartName: string | undefined;
  routeEndName: string | undefined;
  selectedRouteProfile: RouteProfile | null;
  currentIndex: number | null;
  liveDistanceToNext: number | null;
  onInstructionClick: (step: RouteInstruction) => void;
  onStartEndClick: (type: "start" | "end") => void;
  onClose: () => void;
}

export function NavigationStepsSheet({
  instructions,
  routeStartName,
  routeEndName,
  selectedRouteProfile,
  currentIndex,
  liveDistanceToNext,
  onInstructionClick,
  onStartEndClick,
  onClose,
}: NavigationStepsSheetProps) {
  return (
    <div className="absolute inset-0 z-40 bg-white flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <h2 className="text-base font-bold text-gray-900">Maršrutas</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Uždaryti"
          className="p-2 -mr-2 text-gray-400 hover:text-gray-900"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <RouteStepsList
          instructions={instructions}
          routeStartName={routeStartName}
          routeEndName={routeEndName}
          selectedRouteProfile={selectedRouteProfile}
          onInstructionClick={onInstructionClick}
          onStartEndClick={onStartEndClick}
          currentIndex={currentIndex}
          liveDistanceToNext={liveDistanceToNext}
        />
      </div>
    </div>
  );
}
