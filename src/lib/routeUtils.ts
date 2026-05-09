import type { RouteProfile } from "@/config/map-profiles";

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
