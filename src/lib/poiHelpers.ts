import type { Feature } from "geojson";
import type { Map as MapLibreMap } from "maplibre-gl";

/**
 * Query and extract POI feature by object ID
 */
export function getPoiFromObjectId(
  map: MapLibreMap,
  layerId: string,
  objectId: string,
): Feature | null {
  if (!map.getLayer(layerId)) {
    return null;
  }

  // Query for the feature
  const features = map.queryRenderedFeatures({
    layers: [layerId],
    filter: ["==", "id", Number.parseInt(objectId, 10)],
  });

  if (features.length > 0) {
    return features[0] as Feature;
  }

  return null;
}
