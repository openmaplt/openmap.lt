import type { FeatureCollection } from "geojson";
import type { LngLatBounds } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

export function usePlaces(bbox: LngLatBounds | null, types: string) {
  const [places, setPlaces] = useState<FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!bbox || !types) {
      setPlaces({ type: "FeatureCollection", features: [] });
      return;
    }

    const fetchPlaces = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      try {
        const [west, south, east, north] = bbox.toArray().flat();
        const res = await fetch(
          `/api/list?bbox=${west},${south},${east},${north}&type=${types}`,
          { signal: abortControllerRef.current.signal },
        );

        if (res.ok) {
          const data: FeatureCollection = await res.json();

          if (data && data.type === "FeatureCollection") {
            setPlaces(data);
          } else {
            setPlaces({ type: "FeatureCollection", features: [] });
          }
        }
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") {
          console.error("Failed to fetch places:", e);
        }
      } finally {
        setLoading(false);
      }
    };

    // Debounce
    const timeout = setTimeout(fetchPlaces, 300);
    return () => {
      clearTimeout(timeout);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [bbox, types]);

  return { places, loading };
}
