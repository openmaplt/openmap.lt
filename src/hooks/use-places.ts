import type { FeatureCollection } from "geojson";
import type { LngLatBounds } from "maplibre-gl";
import useSWR from "swr";
import { getPoiList } from "@/data/poiList";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const EMPTY_FEATURE_COLLECTION: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export function usePlaces(bbox: LngLatBounds | null, types: string) {
  // toArray() returns a fresh array every call, so derive a primitive string
  // key before debouncing/using it as an SWR key.
  const bboxKey = bbox ? bbox.toArray().flat().join(",") : null;
  const debouncedBboxKey = useDebouncedValue(bboxKey, 300);
  const debouncedTypes = useDebouncedValue(types, 300);

  const { data, isLoading } = useSWR(
    debouncedBboxKey && debouncedTypes
      ? ["places", debouncedBboxKey, debouncedTypes]
      : null,
    ([, key, t]) => getPoiList(key.split(",").map(Number), t),
    // Without this, every bbox change (i.e. every zoom/pan tick) swaps to a
    // key SWR hasn't cached yet, so `data` goes undefined for a beat and all
    // markers blink out until the new fetch resolves. Keep showing the
    // previous tile's markers while the new one loads instead.
    { keepPreviousData: true },
  );

  return { places: data ?? EMPTY_FEATURE_COLLECTION, loading: isLoading };
}
