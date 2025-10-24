import type { Map as MapLibreMap } from "maplibre-gl";
import { Marker } from "maplibre-gl";
import { useCallback, useRef } from "react";

/**
 * Custom hook to manage POI marker on the map
 */
export function usePoiMarker() {
  const markerRef = useRef<Marker | null>(null);

  const createMarker = useCallback(
    (map: MapLibreMap, lng: number, lat: number) => {
      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Create marker element
      const markerElement = document.createElement("div");
      markerElement.className = "poi-marker";
      markerElement.style.width = "20px";
      markerElement.style.height = "20px";
      markerElement.style.borderRadius = "50%";
      markerElement.style.backgroundColor = "#3b82f6";
      markerElement.style.border = "3px solid white";
      markerElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
      markerElement.style.cursor = "pointer";

      // Create and add marker
      const marker = new Marker({ element: markerElement })
        .setLngLat([lng, lat])
        .addTo(map);

      markerRef.current = marker;
    },
    [],
  );

  const removeMarker = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, []);

  return { createMarker, removeMarker };
}
