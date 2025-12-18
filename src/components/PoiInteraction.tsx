import type { Feature } from "geojson";
import type { MapLayerMouseEvent } from "maplibre-gl";
import { useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";
import type { MapProfile } from "@/config/map";
import { getObjectId } from "@/lib/poiData";

const INTERACTIVE_LAYER = "label-amenity";

export function PoiInteraction({
  activeMapProfile,
  onSelectFeature,
}: {
  activeMapProfile: MapProfile;
  onSelectFeature: (feature: Feature | null) => void;
}) {
  const { current: mapRef } = useMap();

  // Handle click on POI and map canvas clicks
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    // Handle clicks on empty canvas (not on POI) - close the sheet
    const handleMapClick = (e: MapLayerMouseEvent) => {
      // Check if we clicked on a POI layer feature
      if (!map.getLayer(INTERACTIVE_LAYER)) {
        onSelectFeature(null);
        return;
      }

      const features = map.queryRenderedFeatures(e.point, {
        layers: [INTERACTIVE_LAYER],
      });

      // If no POI features at this point, close sheet
      if (features.length === 0) {
        onSelectFeature(null);
        return;
      }

      const feature = features[0];
      const objId = getObjectId(feature.properties, feature.layer.id);
      if (objId) {
        onSelectFeature(feature);
      }
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
      // Check if map style is still available before trying to get layer
      if (map.style && map.getLayer(INTERACTIVE_LAYER)) {
        map.off("click", handleMapClick);
        map.off("mouseenter", INTERACTIVE_LAYER, handleMouseEnter);
        map.off("mouseleave", INTERACTIVE_LAYER, handleMouseLeave);
        map.off("styledata", setupEventHandlers);
      }
    };
  }, [mapRef, onSelectFeature]);

  return null;
}
