import useSWR from "swr";
import { search } from "@/data/search";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function useSearch(
  query: string,
  mapCenter: { lat: number; lng: number },
  mapType?: string | null,
) {
  const debouncedQuery = useDebouncedValue(query, 500);
  const debouncedLat = useDebouncedValue(mapCenter.lat, 500);
  const debouncedLng = useDebouncedValue(mapCenter.lng, 500);
  const debouncedMapType = useDebouncedValue(mapType, 500);

  const { data, isLoading } = useSWR(
    debouncedQuery.length >= 3
      ? ["search", debouncedQuery, debouncedLat, debouncedLng, debouncedMapType]
      : null,
    ([, q, lat, lng, type]) => search(q, [lng, lat], type),
    // Keep showing the previous results while a new debounced query is
    // in flight, instead of flashing empty between keystrokes.
    { keepPreviousData: true },
  );

  return { results: data?.features ?? [], loading: isLoading };
}
