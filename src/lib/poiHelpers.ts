import type { Map as MapLibreMap } from "maplibre-gl";
import { extractPoiData, type PoiData, parseObjectId } from "@/lib/poiData";

interface PointGeometry {
  type: "Point";
  coordinates: [number, number];
}

export interface PoiFeatureData {
  data: PoiData;
  coordinates: [number, number];
}

/**
 * Query and extract POI data from a map feature by object ID
 */
export function getPoiFromObjectId(
  map: MapLibreMap,
  objectId: string,
): PoiFeatureData | null {
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
    const feature = features[0];
    const properties = feature.properties;
    const coordinates = (
      feature.geometry as PointGeometry
    ).coordinates.slice() as [number, number];

    const data = extractPoiData(properties);

    return { data, coordinates };
  }

  return null;
}
