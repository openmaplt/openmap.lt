import type { Feature } from "geojson";
import type { MapLayerMouseEvent, MapSourceDataEvent } from "maplibre-gl";
import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";
import { getPoiFromObjectId } from "@/lib/poiHelpers";

const INTERACTIVE_LAYER = "label-amenity";

interface PoiInteractionProps {
  poiId?: string | null;
  onSelectFeature: (feature: Feature | null) => void;
}

export function PoiInteraction({
  onSelectFeature,
  poiId,
}: PoiInteractionProps) {
  const { current: mapRef } = useMap();

  // Handle click on POI and map canvas clicks
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    // Handle clicks on empty canvas (not on POI) - close the poi details
    const handleMapClick = (e: MapLayerMouseEvent) => {
      // Check if we clicked on a POI layer feature
      if (!map.getLayer(INTERACTIVE_LAYER)) {
        onSelectFeature(null);
        return;
      }

      const features = map.queryRenderedFeatures(e.point, {
        layers: [INTERACTIVE_LAYER],
      });

      // If no POI features at this point, close poi details
      if (features.length === 0) {
        onSelectFeature(null);
        return;
      }

      onSelectFeature(features[0]);
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const setupEventHandlers = () => {
      if (map.getLayer(INTERACTIVE_LAYER)) {
        map.on("click", handleMapClick);
        map.on("mouseenter", INTERACTIVE_LAYER, handleMouseEnter);
        map.on("mouseleave", INTERACTIVE_LAYER, handleMouseLeave);
      }
    };

    if (map.isStyleLoaded()) {
      setupEventHandlers();
    } else {
      map.on("styledata", setupEventHandlers);
    }

    return () => {
      if (map?.getLayer(INTERACTIVE_LAYER)) {
        map.off("click", handleMapClick);
        map.off("mouseenter", INTERACTIVE_LAYER, handleMouseEnter);
        map.off("mouseleave", INTERACTIVE_LAYER, handleMouseLeave);
        map.off("styledata", setupEventHandlers);
      }
    };
  }, [mapRef, onSelectFeature]);

  // Handle object ID changes from URL
  useEffect(() => {
    if (!poiId) {
      onSelectFeature(null);
      return;
    }

    const map = mapRef?.getMap();
    if (!map) return;

    const displayPoi = () => {
      const feature = getPoiFromObjectId(map, INTERACTIVE_LAYER, poiId);
      if (feature) {
        onSelectFeature(feature);
      }
    };

    const handleSourceData = (e: MapSourceDataEvent) => {
      if (e.isSourceLoaded) {
        displayPoi();
      }
    };

    if (map.isStyleLoaded()) {
      displayPoi();
    } else {
      map.once("load", displayPoi);
    }

    map.on("sourcedata", handleSourceData);

    return () => {
      if (!map) return;
      map.off("sourcedata", handleSourceData);
    };
  }, [mapRef, onSelectFeature, poiId]);

  return null;
}
