import type { RouteProfile } from "@/config/map-profiles";
import { type RouteInstruction, RouteSign } from "@/hooks/use-routing";

export function formatDistance(dist: number): string {
  if (dist < 1000) {
    return `${Math.round(dist)} m`;
  }
  return `${(dist / 1000).toFixed(1)} km`;
}

export function formatTime(ms: number): string | null {
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) {
    return null;
  }
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} val. ${m > 0 ? `${m} min` : ""}`;
}

/**
 * Finds the instruction the traveler is currently on, based on the vertex
 * index of their snapped position along the route line.
 */
export function getActiveInstructionIndex(
  instructions: RouteInstruction[],
  currentIndex: number | null,
): number | null {
  if (currentIndex == null) return null;
  const idx = instructions.findIndex(
    (step) =>
      step.sign !== RouteSign.Finish && step.interval[1] >= currentIndex,
  );
  return idx === -1 ? null : idx;
}

export function getActionWord(profile: RouteProfile | null): string {
  switch (profile) {
    case "kayak":
      return "Plaukti";
    case "bike":
      return "Minat";
    case "foot":
      return "Eiti";
    default:
      return "Važiuoti";
  }
}
