import { point } from "@turf/helpers";
import length from "@turf/length";
import lineSlice from "@turf/line-slice";
import type { Feature, LineString } from "geojson";
import { useMemo } from "react";
import { getActiveInstructionIndex } from "@/lib/routeUtils";
import { useNavigationProgress } from "@/providers/RouteProvider";
import { type RouteInstruction, RouteSign } from "./use-routing";

/**
 * Derives which maneuver to announce to the traveler, the live distance to
 * it, and a remaining-time estimate that accounts for it.
 *
 * GraphHopper's instruction.text describes the maneuver at the *start* of
 * that instruction's interval - by the time the traveler is inside a given
 * segment, its own maneuver already happened. The one to announce (with a
 * shrinking countdown) is therefore the *next* instruction, not the one
 * whose interval currently contains the traveler's position.
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
  // The segment currently underway; its maneuver already happened.
  const currentSegment = activeIdx != null ? steps[activeIdx] : null;
  // The upcoming maneuver - this is what gets announced/counted down to.
  const activeInstruction =
    activeIdx != null ? (steps[activeIdx + 1] ?? null) : null;
  const nextInstruction =
    activeIdx != null ? (steps[activeIdx + 2] ?? null) : null;
  // No more turns left - just walking/driving the final stretch to the
  // destination on the current street.
  const isLastLeg =
    activeIdx != null && activeIdx === steps.length - 1 && !activeInstruction;

  const liveDistanceToNext = useMemo(() => {
    if (!routeLine || !progress.position || !currentSegment) return null;
    const maneuverCoord =
      routeLine.geometry.coordinates[currentSegment.interval[1]];
    if (!maneuverCoord) return null;
    const slice = lineSlice(
      point(progress.position),
      point(maneuverCoord),
      routeLine,
    );
    return length(slice, { units: "meters" });
  }, [routeLine, progress.position, currentSegment]);

  const remainingTime = useMemo(() => {
    if (activeIdx == null) return progress.remainingTime;

    let total = 0;
    for (let i = activeIdx + 1; i < steps.length; i++) total += steps[i].time;

    if (currentSegment) {
      if (currentSegment.distance > 0 && liveDistanceToNext != null) {
        total +=
          currentSegment.time *
          Math.min(liveDistanceToNext / currentSegment.distance, 1);
      } else {
        total += currentSegment.time;
      }
    }
    return total;
  }, [
    activeIdx,
    steps,
    liveDistanceToNext,
    progress.remainingTime,
    currentSegment,
  ]);

  return {
    currentIndex: progress.currentIndex,
    activeIdx,
    activeInstruction,
    nextInstruction,
    isLastLeg,
    liveDistanceToNext,
    activeDistance: liveDistanceToNext ?? currentSegment?.distance ?? null,
    remainingTime,
  };
}
