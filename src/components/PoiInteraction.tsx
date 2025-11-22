import type { Feature } from "geojson";
import type { MapLayerMouseEvent, MapSourceDataEvent } from "maplibre-gl";
import { useCallback, useEffect, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import type { MapProfile } from "@/config/map";
import { useHashChange } from "@/hooks/use-hash-change";
import { getObjectId } from "@/lib/poiData";
import { getPoiFromObjectId } from "@/lib/poiHelpers";
import {
  formatHash,
  getMapState,
  type MapState,
  parseHash,
} from "@/lib/urlHash";

const INTERACTIVE_LAYER = "label-amenity";

export function PoiInteraction({
  activeMapProfile,
  onSelectFeature,
}: {
  activeMapProfile: MapProfile;
  onSelectFeature: (feature: Feature | null) => void;
}) {
  const { current: mapRef } = useMap();
  const [objectId, setObjectId] = useState<string | undefined>(() => {
    const parsedHash = parseHash(window.location.hash);
    return parsedHash?.objectId;
  });

  // Update URL hash when objectId changes
  useEffect(() => {
    const mapState = getMapState();
    const hashData: MapState = {
      ...mapState,
      objectId,
    };
    window.history.replaceState(null, "", formatHash(hashData));
  }, [objectId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: activeMapProfile.id is sufficient
  useEffect(() => {
    setObjectId(undefined);
  }, [activeMapProfile.id]);

  // Handle click on POI and map canvas clicks
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    // Handle clicks on empty canvas (not on POI) - close the sheet
    const handleMapClick = (e: MapLayerMouseEvent) => {
      // Check if we clicked on a POI layer feature
      if (!map.getLayer(INTERACTIVE_LAYER)) {
        setObjectId(undefined);
        return;
      }

      const features = map.queryRenderedFeatures(e.point, {
        layers: [INTERACTIVE_LAYER],
      });

      // If no POI features at this point, close sheet
      if (features.length === 0) {
        setObjectId(undefined);
        return;
      }

      const feature = features[0];
      const objId = getObjectId(feature.properties, feature.layer.id);
      if (objId) {
        setObjectId(objId);
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
      if (map.getLayer(INTERACTIVE_LAYER)) {
        map.off("click", handleMapClick);
        map.off("mouseenter", INTERACTIVE_LAYER, handleMouseEnter);
        map.off("mouseleave", INTERACTIVE_LAYER, handleMouseLeave);
        map.off("styledata", setupEventHandlers);
      }
    };
  }, [mapRef]);

  // Handle object ID changes from URL
  useEffect(() => {
    if (!objectId) {
      onSelectFeature(null);
      return;
    }

    const map = mapRef?.getMap();
    if (!map) return;

    const displayPoi = () => {
      const feature = getPoiFromObjectId(map, objectId);
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
      map.off("sourcedata", handleSourceData);
    };
  }, [objectId, mapRef, onSelectFeature]);

  // Listen for hash changes to update object ID
  useHashChange(
    useCallback(() => {
      const newState = parseHash(window.location.hash);
      const newObjectId = newState?.objectId;
      if (newObjectId !== objectId) {
        setObjectId(newObjectId);
      }
    }, [objectId]),
  );

  return null;
}
