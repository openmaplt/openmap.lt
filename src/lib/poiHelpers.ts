import type { Point } from "geojson";
import type { Map as MapLibreMap } from "maplibre-gl";
import { extractPoiData, type PoiData, parseObjectId } from "@/lib/poiData";

export interface PointCoordinates {
  longitude: number;
  latitude: number;
}

export interface PoiFeatureData {
  data: PoiData;
  coordinates: PointCoordinates;
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
    const geometry = feature.geometry as Point;

    return {
      data: extractPoiData(feature.properties),
      coordinates: {
        longitude: geometry.coordinates[0],
        latitude: geometry.coordinates[1],
      },
    };
  }

  return null;
}
