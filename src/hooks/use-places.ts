import type { LngLatBounds } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

export interface Place {
  id: number;
  attr: Record<string, string>[];
  geom: [number, number];
  type: string;
}

export function usePlaces(bbox: LngLatBounds | null, types: string) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!bbox || !types) {
      setPlaces([]);
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
          const data: Place[] = await res.json();

          if (Array.isArray(data)) {
            setPlaces(data);
          } else {
            setPlaces([]);
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
