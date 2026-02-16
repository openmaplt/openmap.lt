import type { Feature } from "geojson";
import { useEffect, useState } from "react";
import { search } from "@/data/search";

export function useSearch(
  query: string,
  mapCenter: { lat: number; lng: number },
) {
  const [results, setResults] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);

    const fetchResults = async () => {
      try {
        const data = await search(query, [mapCenter.lng, mapCenter.lat]);
        setResults(data.features || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [query, mapCenter]);

  return { results, loading };
}
