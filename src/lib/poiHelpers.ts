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

/**
 * Get center coordinates of a feature for markers or map centering
 */
export function getFeatureCenter(
  feature: Feature | null,
): [number, number] | null {
  if (!feature || !feature.geometry) return null;

  if (feature.geometry.type === "Point") {
    return feature.geometry.coordinates as [number, number];
  }

  if (
    feature.geometry.type === "Polygon" ||
    feature.geometry.type === "MultiPolygon"
  ) {
    // Calculate centroid of the polygon (outer ring only)
    // For MultiPolygon, use the first polygon
    const polygonCoordinates =
      feature.geometry.type === "Polygon"
        ? feature.geometry.coordinates
        : feature.geometry.coordinates[0];

    if (!polygonCoordinates || polygonCoordinates.length === 0) return null;

    const coordinates = polygonCoordinates[0] as Array<[number, number]>;
    let sumLng = 0;
    let sumLat = 0;

    for (const [lon, la] of coordinates) {
      sumLng += lon;
      sumLat += la;
    }

    return [sumLng / coordinates.length, sumLat / coordinates.length];
  }

  if (
    feature.geometry.type === "LineString" ||
    feature.geometry.type === "MultiLineString"
  ) {
    const lineCoordinates =
      feature.geometry.type === "LineString"
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;

    let sumLng = 0;
    let sumLat = 0;
    let totalPoints = 0;

    for (const line of lineCoordinates) {
      for (const [lon, la] of line as Array<[number, number]>) {
        sumLng += lon;
        sumLat += la;
        totalPoints++;
      }
    }

    if (totalPoints === 0) return null;
    return [sumLng / totalPoints, sumLat / totalPoints];
  }

  return null;
}
