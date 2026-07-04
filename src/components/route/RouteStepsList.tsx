"use client";

import { MapPin } from "lucide-react";
import type { RouteProfile } from "@/config/map-profiles";
import { type RouteInstruction, RouteSign } from "@/hooks/use-routing";
import { getActionWord, getActiveInstructionIndex } from "@/lib/routeUtils";
import { RouteStepItem } from "./RouteStepItem";

interface RouteStepsListProps {
  instructions: RouteInstruction[];
  routeStartName: string | undefined;
  routeEndName: string | undefined;
  selectedRouteProfile: RouteProfile | null;
  onInstructionClick: (step: RouteInstruction) => void;
  onStartEndClick: (type: "start" | "end") => void;
  currentIndex?: number | null;
  liveDistanceToNext?: number | null;
}

export function RouteStepsList({
  instructions,
  routeStartName,
  routeEndName,
  selectedRouteProfile,
  onInstructionClick,
  onStartEndClick,
  currentIndex,
  liveDistanceToNext,
}: RouteStepsListProps) {
  const actionWord = getActionWord(selectedRouteProfile);

  const steps = instructions.filter((step) => step.sign !== RouteSign.Finish);
  const activeIdx = getActiveInstructionIndex(steps, currentIndex ?? null);
  const visibleSteps = activeIdx == null ? steps : steps.slice(activeIdx);

  return (
    <div className="flex flex-col gap-0 pb-10">
      <button
        type="button"
        className="w-full flex gap-4 py-4 px-4 border-b border-gray-50 items-start bg-blue-50/10 hover:bg-blue-50/30 cursor-pointer transition-colors text-left"
        onClick={() => onStartEndClick("start")}
      >
        <div className="mt-1 bg-green-100 p-2 rounded-full border border-green-200">
          <MapPin className="w-4 h-4 text-green-700" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-0.5">
            PRADŽIA
          </p>
          <p className="text-[15px] font-bold text-gray-900 leading-tight">
            {routeStartName || "Pasirinkta vieta"}
          </p>
        </div>
      </button>

      <div className="relative">
        <div className="absolute left-[35px] top-6 bottom-6 w-0.5 bg-gray-100" />
        {visibleSteps.map((step, idx) => {
          const displayStep =
            idx === 0 && liveDistanceToNext != null
              ? { ...step, distance: liveDistanceToNext }
              : step;
          return (
            <RouteStepItem
              key={`${idx}-${step.text.substring(0, 10)}`}
              step={displayStep}
              idx={idx}
              actionWord={actionWord}
              selectedRouteProfile={selectedRouteProfile}
              onClick={() => onInstructionClick(step)}
            />
          );
        })}
      </div>

      <button
        type="button"
        className="w-full flex gap-4 py-4 px-4 border-t border-gray-100 items-start bg-red-50/10 hover:bg-red-50/30 cursor-pointer transition-colors text-left"
        onClick={() => onStartEndClick("end")}
      >
        <div className="mt-1 bg-red-100 p-2 rounded-full border border-red-200">
          <MapPin className="w-4 h-4 text-red-700" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-0.5">
            PABAIGA
          </p>
          <p className="text-[15px] font-bold text-gray-900 leading-tight">
            {routeEndName || "Pasirinkta vieta"}
          </p>
        </div>
      </button>
    </div>
  );
}
