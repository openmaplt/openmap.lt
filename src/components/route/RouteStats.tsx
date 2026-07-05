"use client";

import { useState } from "react";
import { useActiveInstruction } from "@/hooks/use-active-instruction";
import { formatDistance, formatTime } from "@/lib/routeUtils";
import {
  useNavigationProgress,
  useRoute,
  useRouteResult,
} from "@/providers/RouteProvider";
import { DownloadMenu } from "./DownloadMenu";

const PROFILE_EMOJI: Record<string, string> = {
  bike: "🚲",
  car: "🚗",
  foot: "🚶",
  kayak: "🛶",
};

export function RouteStats() {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const { selectedRouteProfile } = useRoute();
  const { routeLine, distance, time, instructions } = useRouteResult();
  const { remainingDistance } = useNavigationProgress();
  const { remainingTime } = useActiveInstruction(instructions, routeLine);

  if (distance === null || time === null) return null;

  const emoji =
    (selectedRouteProfile && PROFILE_EMOJI[selectedRouteProfile]) ?? "🧭";
  // Once navigation has been started at least once, keep showing "remaining
  // from last known position" (even while paused) instead of snapping back
  // to the full trip totals — remainingDistance/Time stay populated until a
  // genuinely new route is computed.
  const displayedDistance = remainingDistance ?? distance;
  const displayedTime = remainingTime ?? time;

  return (
    <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-gray-50">
      <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex gap-2 items-center shadow-sm border border-blue-100/50 whitespace-nowrap">
        <span className="text-base">{emoji}</span>
        {formatDistance(displayedDistance)}
      </span>
      <span className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg flex gap-2 items-center shadow-sm border border-gray-100 whitespace-nowrap">
        <span>⏱️</span> {formatTime(displayedTime) || "1 min"}
      </span>
      {routeLine && (
        <DownloadMenu
          routeLine={routeLine}
          instructions={instructions}
          open={downloadOpen}
          onOpenChange={setDownloadOpen}
        />
      )}
    </div>
  );
}
