import { lineString } from "@turf/helpers";
import type { Feature, LineString } from "geojson";
import useSWR from "swr";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
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
  startLng: number,
  startLat: number,
  endLng: number,
  endLat: number,
  routingProfile: string,
  routingUrl: string,
): Promise<RouteData> {
  const url = new URL(routingUrl);
  // GraphHopper Routing API requires points as lat,lng
  url.searchParams.append("point", `${startLat},${startLng}`);
  url.searchParams.append("point", `${endLat},${endLng}`);
  url.searchParams.append("profile", routingProfile);
  url.searchParams.append("elevation", "false");
  url.searchParams.append("locale", "lt");
  url.searchParams.append("points_encoded", "true");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const path = data.paths?.[0];
  if (!path) {
    throw new Error(ROUTE_NOT_FOUND);
  }

  return {
    routeLine: lineString(decodePolyline(path.points, false)),
    distance: path.distance,
    time: path.time,
    instructions: path.instructions ?? [],
  };
}

export function useRouting(
  startFeature: Feature | null,
  endFeature: Feature | null,
  routingProfile: string = "car",
  routingUrl: string = "https://api.openmap.lt/route/route",
): RouteResult {
  const startCoords = startFeature ? getCoordinates(startFeature) : null;
  const endCoords = endFeature ? getCoordinates(endFeature) : null;

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
          debouncedProfile,
          debouncedUrl,
        ]
      : null,
    ([, sLng, sLat, eLng, eLat, profile, url]) =>
      fetchRoute(sLng, sLat, eLng, eLat, profile, url),
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

  return {
    routeLine: data?.routeLine ?? null,
    distance: data?.distance ?? null,
    time: data?.time ?? null,
    instructions: data?.instructions ?? [],
    loading: isLoading,
    error: coordinateError ?? fetchError,
  };
}
