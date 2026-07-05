"use client";

import type { Feature, LineString } from "geojson";
import { useMapActions } from "@/providers/MapProvider";
import { useRoute } from "@/providers/RouteProvider";
import type { RouteInstruction } from "./use-routing";
import { useIsMobile } from "./useIsMobile";

/** Flies the map to a route instruction's or endpoint's coordinate and highlights it. */
export function useRouteMapFocus(routeLine: Feature<LineString> | null) {
  const isMobile = useIsMobile();
  const { mapRef } = useMapActions();
  const { setHighlightedRoutePoint } = useRoute();

  const flyTo = (coords: [number, number] | undefined) => {
    if (!coords || !mapRef.current) return;
    setHighlightedRoutePoint(coords);
    mapRef.current.flyTo({
      center: coords,
      zoom: 17,
      padding: isMobile ? { bottom: 300 } : { left: 400 },
      duration: 1500,
    });
  };

  const flyToInstruction = (step: RouteInstruction) => {
    flyTo(
      routeLine?.geometry.coordinates[step.interval[0]] as
        | [number, number]
        | undefined,
    );
  };

  const flyToEndpoint = (type: "start" | "end") => {
    if (!routeLine) return;
    const coords =
      type === "start"
        ? routeLine.geometry.coordinates[0]
        : routeLine.geometry.coordinates[
            routeLine.geometry.coordinates.length - 1
          ];
    flyTo(coords as [number, number]);
  };

  return { flyToInstruction, flyToEndpoint };
}
