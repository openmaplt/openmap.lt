import { point } from "@turf/helpers";
import length from "@turf/length";
import lineSlice from "@turf/line-slice";
import type { Feature, LineString } from "geojson";
import { useMemo } from "react";
import { getActiveInstructionIndex } from "@/lib/routeUtils";
import { useNavigationProgress } from "@/providers/RouteProvider";
import { type RouteInstruction, RouteSign } from "./use-routing";

/**
 * Derives which instruction the traveler is currently on, the live distance
 * to that maneuver, and a remaining-time estimate that accounts for it -
 * summing GraphHopper's own per-segment times instead of splitting the total
 * time proportionally by distance (which ignores that an uphill or unpaved
 * stretch takes disproportionately longer than its share of the distance).
 */
export function useActiveInstruction(
  instructions: RouteInstruction[],
  routeLine: Feature<LineString> | null,
) {
  const progress = useNavigationProgress();

  const steps = useMemo(
    () => instructions.filter((step) => step.sign !== RouteSign.Finish),
    [instructions],
  );
  const activeIdx = getActiveInstructionIndex(steps, progress.currentIndex);
  const activeInstruction = activeIdx != null ? steps[activeIdx] : null;
  const nextInstruction =
    activeIdx != null ? (steps[activeIdx + 1] ?? null) : null;

  const liveDistanceToNext = useMemo(() => {
    if (!routeLine || !progress.position || !activeInstruction) return null;
    const maneuverCoord =
      routeLine.geometry.coordinates[activeInstruction.interval[1]];
    if (!maneuverCoord) return null;
    const slice = lineSlice(
      point(progress.position),
      point(maneuverCoord),
      routeLine,
    );
    return length(slice, { units: "meters" });
  }, [routeLine, progress.position, activeInstruction]);

  const remainingTime = useMemo(() => {
    if (activeIdx == null) return progress.remainingTime;

    let total = 0;
    for (let i = activeIdx + 1; i < steps.length; i++) total += steps[i].time;

    const active = steps[activeIdx];
    if (active.distance > 0 && liveDistanceToNext != null) {
      total += active.time * Math.min(liveDistanceToNext / active.distance, 1);
    } else {
      total += active.time;
    }
    return total;
  }, [activeIdx, steps, liveDistanceToNext, progress.remainingTime]);

  return {
    currentIndex: progress.currentIndex,
    activeInstruction,
    nextInstruction,
    liveDistanceToNext,
    remainingTime,
  };
}
