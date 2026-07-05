"use client";

import { X } from "lucide-react";
import { useActiveInstruction } from "@/hooks/use-active-instruction";
import { formatDistance, formatTime } from "@/lib/routeUtils";
import {
  useNavigationProgress,
  useRoute,
  useRouteResult,
} from "@/providers/RouteProvider";

export function NavigationProgressBar() {
  const { setNavigationMode } = useRoute();
  const { routeLine, instructions } = useRouteResult();
  const { remainingDistance, error } = useNavigationProgress();
  const { remainingTime } = useActiveInstruction(instructions, routeLine);

  return (
    <div className="absolute bottom-3 left-3 right-3 z-30 bg-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-baseline gap-1.5 min-w-0">
        <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
          Iki tikslo:
        </span>
        <span className="text-base font-black text-gray-900 whitespace-nowrap">
          {remainingDistance != null ? formatDistance(remainingDistance) : "--"}
        </span>
        <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
          {(remainingTime != null && formatTime(remainingTime)) || "< 1 min"}
        </span>
        {error && (
          <span className="text-xs font-medium text-red-600 truncate">
            Nėra GPS signalo
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setNavigationMode(false)}
        className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-sm font-bold shrink-0"
      >
        <X className="w-4 h-4" /> Baigti
      </button>
    </div>
  );
}
