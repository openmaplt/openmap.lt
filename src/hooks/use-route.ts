import type { Feature, LineString } from "geojson";
import { useEffect, useState } from "react";
import { decodePolyline } from "@/lib/polyline";

export interface RouteInstruction {
  distance: number;
  heading?: number;
  sign: number;
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

export function useRoute(
  startFeature: Feature | null,
  endFeature: Feature | null,
  routingProfile: string = "car",
  routingUrl: string = "https://nextgen.openmap.lt/route",
): RouteResult {
  const [routeLine, setRouteLine] = useState<Feature<LineString> | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>(null);
  const [instructions, setInstructions] = useState<RouteInstruction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startFeature || !endFeature) {
      setRouteLine(null);
      setDistance(null);
      setTime(null);
      setInstructions([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const getCoordinates = (feature: Feature): [number, number] | null => {
      if (feature.geometry && feature.geometry.type === "Point") {
        return [
          feature.geometry.coordinates[0], // lng
          feature.geometry.coordinates[1], // lat
        ];
      }
      return null;
    };

    const startCoords = getCoordinates(startFeature);
    const endCoords = getCoordinates(endFeature);

    if (!startCoords || !endCoords) {
      setError("Nepavyko nustatyti taškų koordinatų.");
      setLoading(false);
      return;
    }

    const fetchRoute = async () => {
      try {
        const url = new URL(routingUrl);
        // GraphHopper Routing API requires points as lat,lng
        url.searchParams.append("point", `${startCoords[1]},${startCoords[0]}`);
        url.searchParams.append("point", `${endCoords[1]},${endCoords[0]}`);
        url.searchParams.append("profile", routingProfile);
        url.searchParams.append("elevation", "false");
        url.searchParams.append("locale", "lt");
        // Get encoded polyline for smaller payload
        url.searchParams.append("points_encoded", "true");

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.paths && data.paths.length > 0) {
          const path = data.paths[0];

          // Decode the polyline points
          const coordinates = decodePolyline(path.points);

          const feature: Feature<LineString> = {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates,
            },
          };

          setRouteLine(feature);
          setDistance(path.distance);
          setTime(path.time);
          setInstructions(path.instructions || []);
        } else {
          setError("Maršrutas nerastas.");
        }
      } catch (err) {
        console.error("Routing execution error:", err);
        setError("Klaida nustatant maršrutizavimą.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRoute, 500);

    return () => clearTimeout(timer);
  }, [startFeature, endFeature, routingProfile, routingUrl]);

  return { routeLine, distance, time, instructions, loading, error };
}
