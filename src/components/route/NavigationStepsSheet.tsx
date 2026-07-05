"use client";

import { X } from "lucide-react";
import { useRouteMapFocus } from "@/hooks/use-route-map-focus";
import { useRouteResult } from "@/providers/RouteProvider";
import { RouteStepsList } from "./RouteStepsList";

interface NavigationStepsSheetProps {
  onClose: () => void;
}

export function NavigationStepsSheet({ onClose }: NavigationStepsSheetProps) {
  const { routeLine } = useRouteResult();
  const { flyToInstruction, flyToEndpoint } = useRouteMapFocus(routeLine);

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
          onInstructionClick={(step) => {
            flyToInstruction(step);
            onClose();
          }}
          onStartEndClick={flyToEndpoint}
        />
      </div>
    </div>
  );
}
