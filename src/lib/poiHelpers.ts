import type { Feature } from "geojson";
import type { Map as MapLibreMap } from "maplibre-gl";
import { parseObjectId } from "@/lib/poiData";

/**
 * Query and extract POI feature by object ID
 */
export function getPoiFromObjectId(
  map: MapLibreMap,
  objectId: string,
): Feature | null {
  const parsedId = parseObjectId(objectId);
  if (!parsedId) {
    return null;
  }

  const { layerId, featureId } = parsedId;
  if (!map.getLayer(layerId)) {
    return null;
  }

  // Query for the feature
  const features = map.queryRenderedFeatures({
    layers: [layerId],
    filter: ["==", "id", featureId],
  });

  if (features.length > 0) {
    return features[0] as Feature;
  }

  return null;
}
