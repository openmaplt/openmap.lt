import type { LngLatBounds } from "react-map-gl/maplibre";

/**
 * Dummy API function to get the extent of a point of interest
 * @param pointId The ID of the point of interest
 * @returns A LngLatBounds object or null
 */
export const getPointExtent = async (
  pointId: string,
): Promise<LngLatBounds | null> => {
  console.log(`Fetching extent for point ${pointId}`);
  // In a real application, you would make an API call here.
  // For now, we return a hard-coded value.
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    [23.8, 54.8], // [minLng, minLat]
    [24.0, 55.0], // [maxLng, maxLat]
  ] as LngLatBounds;
};
