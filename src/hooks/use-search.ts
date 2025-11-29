import type { Feature } from "geojson";
import { useEffect, useRef, useState } from "react";

export function useSearch(
  query: string,
  mapCenter: { lat: number; lng: number },
) {
  const [results, setResults] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);

    const fetchResults = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(
          `/api/search?pos=${mapCenter.lng},${mapCenter.lat}&text=${encodeURIComponent(
            query,
          )}`,
          { signal: abortControllerRef.current.signal },
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data.features || []);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Search error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 500);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, mapCenter]);

  return { results, loading };
}
