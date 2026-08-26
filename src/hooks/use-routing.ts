import { lineString } from "@turf/helpers";
import type { Feature, LineString } from "geojson";
import useSWR from "swr";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  DEFAULT_ROUTING_URL,
  fetchGraphHopperRoute,
  RouteNotFoundError,
} from "@/lib/geo";
import { decodePolyline } from "@/lib/polyline";

export const RouteSign = {
  UTurn: -98,
  UTurnLeft: -8,
  KeepLeft: -7,
  TurnSharpLeft: -3,
  TurnLeft: -2,
  TurnSlightLeft: -1,
  ContinueStraight: 0,
  TurnSlightRight: 1,
  TurnRight: 2,
  TurnSharpRight: 3,
  Finish: 4,
  ViaPoint: 5,
  EnterRoundabout: 6,
  KeepRight: 7,
  UTurnRight: 8,
} as const;

export type RouteSign = (typeof RouteSign)[keyof typeof RouteSign];

export interface RouteInstruction {
  distance: number;
  heading?: number;
  sign: RouteSign;
  interval: [number, number];
  text: string;
  time: number;
  street_name: string;
  waterway_milestone_value?: number;
  waterway_obstacle?: string;
  waterway_obstacle_description?: string;
}

interface RouteResult {
  routeLine: Feature<LineString> | null;
  distance: number | null;
  time: number | null;
  instructions: RouteInstruction[];
  loading: boolean;
  error: string | null;
}

interface RouteData {
  routeLine: Feature<LineString>;
  distance: number;
  time: number;
  instructions: RouteInstruction[];
}

const ROUTE_NOT_FOUND = "Maršrutas nerastas.";

function getCoordinates(feature: Feature): [number, number] | null {
  if (feature.geometry && feature.geometry.type === "Point") {
    return [feature.geometry.coordinates[0], feature.geometry.coordinates[1]];
  }
  return null;
}

async function fetchRoute(
  points: [number, number][],
  routingProfile: string,
  routingUrl: string,
): Promise<RouteData> {
  let path: Awaited<ReturnType<typeof fetchGraphHopperRoute>>;
  try {
    path = await fetchGraphHopperRoute(points, routingProfile, routingUrl);
  } catch (error) {
    if (error instanceof RouteNotFoundError) {
      throw new Error(ROUTE_NOT_FOUND);
    }
    throw error;
  }

  return {
    routeLine: lineString(decodePolyline(path.points, false)),
    distance: path.distance,
    time: path.time,
    instructions: (path.instructions ?? []) as RouteInstruction[],
  };
}

export function useRouting(
  startFeature: Feature | null,
  endFeature: Feature | null,
  waypointFeatures: Feature[] = [],
  routingProfile: string = "car",
  routingUrl: string = DEFAULT_ROUTING_URL,
): RouteResult {
  const startCoords = startFeature ? getCoordinates(startFeature) : null;
  const endCoords = endFeature ? getCoordinates(endFeature) : null;
  const waypointCoords = waypointFeatures
    .map(getCoordinates)
    .filter((c): c is [number, number] => c !== null);

  // Debounce the primitive coordinates (not the Feature objects, which get a
  // new identity every render) so a stable, serializable SWR key emerges.
  const debouncedStartLng = useDebouncedValue(startCoords?.[0] ?? null, 500);
  const debouncedStartLat = useDebouncedValue(startCoords?.[1] ?? null, 500);
  const debouncedEndLng = useDebouncedValue(endCoords?.[0] ?? null, 500);
  const debouncedEndLat = useDebouncedValue(endCoords?.[1] ?? null, 500);
  const debouncedProfile = useDebouncedValue(routingProfile, 500);
  const debouncedUrl = useDebouncedValue(routingUrl, 500);

  const hasDebouncedCoords =
    debouncedStartLng != null &&
    debouncedStartLat != null &&
    debouncedEndLng != null &&
    debouncedEndLat != null;

  const { data, error, isLoading } = useSWR(
    hasDebouncedCoords
      ? [
          "route",
          debouncedStartLng,
          debouncedStartLat,
          debouncedEndLng,
          debouncedEndLat,
          // Waypoints (currently only set programmatically, e.g. by
          // AI-generated routes — never dragged/typed interactively) don't
          // need their own debounce; SWR deep-compares array keys by
          // content, so this is a stable key on its own.
          waypointCoords,
          debouncedProfile,
          debouncedUrl,
        ]
      : null,
    ([, sLng, sLat, eLng, eLat, waypoints, profile, url]) =>
      fetchRoute([[sLng, sLat], ...waypoints, [eLng, eLat]], profile, url),
    {
      // Keep showing the previous route while a new one (e.g. a dragged
      // endpoint) is loading, instead of flashing the line off the map.
      keepPreviousData: true,
      onError: (err) => console.error("Routing execution error:", err),
    },
  );

  const coordinateError =
    (startFeature && !startCoords) || (endFeature && !endCoords)
      ? "Nepavyko nustatyti taškų koordinatų."
      : null;

  const fetchError = error
    ? error instanceof Error && error.message === ROUTE_NOT_FOUND
      ? ROUTE_NOT_FOUND
      : "Klaida nustatant maršrutizavimą."
    : null;

  // keepPreviousData keeps `data` around across a key transition, INCLUDING
  // the transition to `null` (both endpoints intentionally cleared) — gate
  // on hasDebouncedCoords so closing the route actually clears the map
  // instead of leaving the last-fetched line/stats displayed forever.
  return {
    routeLine: hasDebouncedCoords ? (data?.routeLine ?? null) : null,
    distance: hasDebouncedCoords ? (data?.distance ?? null) : null,
    time: hasDebouncedCoords ? (data?.time ?? null) : null,
    instructions: hasDebouncedCoords ? (data?.instructions ?? []) : [],
    loading: isLoading,
    error: coordinateError ?? fetchError,
  };
}
