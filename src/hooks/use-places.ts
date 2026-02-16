import type { FeatureCollection } from "geojson";
import type { LngLatBounds } from "maplibre-gl";
import { useEffect, useState } from "react";
import { getPoiList } from "@/data/poiList";

export function usePlaces(bbox: LngLatBounds | null, types: string) {
  const [places, setPlaces] = useState<FeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bbox || !types) {
      setPlaces({ type: "FeatureCollection", features: [] });
      return;
    }

    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const coords = bbox.toArray().flat() as number[];
        const data = await getPoiList(coords, types);

        if (
          data &&
          data.type === "FeatureCollection" &&
          Array.isArray(data.features)
        ) {
          setPlaces(data);
        } else {
          setPlaces({
            type: "FeatureCollection",
            features: Array.isArray(data) ? data : [],
          });
        }
      } catch (e) {
        console.error("Failed to fetch places:", e);
      } finally {
        setLoading(false);
      }
    };

    // Debounce
    const timeout = setTimeout(fetchPlaces, 300);
    return () => {
      clearTimeout(timeout);
    };
  }, [bbox, types]);

  return { places, loading };
}
