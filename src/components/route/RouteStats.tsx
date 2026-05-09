"use client";

import type { Feature, LineString } from "geojson";
import { useState } from "react";
import type { RouteProfile } from "@/config/map-profiles";
import { formatDistance, formatTime } from "@/lib/routeUtils";
import { DownloadMenu } from "./DownloadMenu";

const PROFILE_EMOJI: Record<string, string> = {
  bike: "🚲",
  car: "🚗",
  foot: "🚶",
  kayak: "🛶",
};

interface RouteStatsProps {
  distance: number;
  time: number;
  routeLine: Feature<LineString> | null;
  selectedRouteProfile: RouteProfile | null;
}

export function RouteStats({
  distance,
  time,
  routeLine,
  selectedRouteProfile,
}: RouteStatsProps) {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const emoji =
    (selectedRouteProfile && PROFILE_EMOJI[selectedRouteProfile]) ?? "🧭";

  return (
    <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
      <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg flex gap-2 items-center shadow-sm border border-blue-100/50">
        <span className="text-base">{emoji}</span>
        {formatDistance(distance)}
      </span>
      <span className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg flex gap-2 items-center shadow-sm border border-gray-100">
        <span>⏱️</span> {formatTime(time) || "1 min"}
      </span>
      {routeLine && (
        <DownloadMenu
          routeLine={routeLine}
          open={downloadOpen}
          onOpenChange={setDownloadOpen}
        />
      )}
    </div>
  );
}
