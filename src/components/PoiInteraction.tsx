"use client";

import type { MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { Popup, useMap } from "react-map-gl/maplibre";
import { PoiContent } from "@/components/PoiContent";
import {
  extractPoiData,
  getObjectId,
  type PoiData,
  parseObjectId,
} from "@/lib/poiData";
import {
  formatHash,
  getMapState,
  type MapState,
  parseHash,
} from "@/lib/urlHash";

interface PointGeometry {
  type: "Point";
  coordinates: [number, number];
}

const INTERACTIVE_LAYER = "label-amenity";

export function PoiInteraction() {
  const { current: map } = useMap();
  const [objectId, setObjectId] = useState<string | undefined>(() => {
    const parsedHash = parseHash(window.location.hash);
    return parsedHash?.objectId;
  });

  const [popupInfo, setPopupInfo] = useState<{
    longitude: number;
    latitude: number;
    data: PoiData;
  } | null>(null);
  const hasProcessedInitialObjectId = useRef(false);

  useEffect(() => {
    const mapState = getMapState();
    const hashData: MapState = {
      ...mapState,
      objectId,
    };
    window.history.replaceState(null, "", formatHash(hashData));
  }, [objectId]);

  // Handle click on POI
  useEffect(() => {
    if (!map) return;

    const handleClick = (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const coordinates = (
        feature.geometry as PointGeometry
      ).coordinates.slice();
      const properties = feature.properties;

      // Ensure popup appears on the copy of the feature closest to the center
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      // Extract POI data
      const data = extractPoiData(properties);

      // Set popup
      setPopupInfo({
        longitude: coordinates[0],
        latitude: coordinates[1],
        data,
      });

      // Update URL with object ID
      const objectId = getObjectId(properties, feature.layer.id);
      if (objectId) {
        setObjectId(objectId);
      }
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const setupEventHandlers = () => {
      // Check if the layer exists before adding handlers
      if (map.getLayer(INTERACTIVE_LAYER)) {
        map.on("click", INTERACTIVE_LAYER, handleClick);
        map.on("mouseenter", INTERACTIVE_LAYER, handleMouseEnter);
        map.on("mouseleave", INTERACTIVE_LAYER, handleMouseLeave);
        return true;
      }
      return false;
    };

    // If map style is loaded, setup handlers immediately
    if (map.isStyleLoaded()) {
      setupEventHandlers();
    } else {
      // Otherwise, wait for style to load
      map.once("styledata", setupEventHandlers);
    }

    return () => {
      if (map.getLayer(INTERACTIVE_LAYER)) {
        map.off("click", INTERACTIVE_LAYER, handleClick);
        map.off("mouseenter", INTERACTIVE_LAYER, handleMouseEnter);
        map.off("mouseleave", INTERACTIVE_LAYER, handleMouseLeave);
      }
    };
  }, [map]);

  // Handle popup close
  const handlePopupClose = () => {
    setPopupInfo(null);
    setObjectId(undefined);
  };

  // Handle initial object ID from URL
  useEffect(() => {
    if (!objectId || hasProcessedInitialObjectId.current || !map) {
      return;
    }

    const showPopup = () => {
      const parsedId = parseObjectId(objectId);
      if (!parsedId) {
        return;
      }

      const { layerId, featureId } = parsedId;

      if (!map.getLayer(layerId)) {
        return;
      }

      // Wait a bit for layers to be ready
      setTimeout(() => {
        const features = map.queryRenderedFeatures({
          layers: [layerId],
          filter: ["==", "id", featureId],
        });

        if (features.length > 0) {
          const feature = features[0];
          const coordinates = (
            feature.geometry as PointGeometry
          ).coordinates.slice();
          const properties = feature.properties;

          const data = extractPoiData(properties);

          setPopupInfo({
            longitude: coordinates[0],
            latitude: coordinates[1],
            data,
          });

          hasProcessedInitialObjectId.current = true;
        }
      }, 500);
    };

    if (map.isStyleLoaded()) {
      showPopup();
    } else {
      // Otherwise, wait for style to load
      map.once("styledata", showPopup);
    }

    const handleHashChange = () => {
      hasProcessedInitialObjectId.current = false;
      const newState = parseHash(window.location.hash);
      setObjectId(newState?.objectId);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [objectId, map]);

  return popupInfo ? (
    <Popup
      longitude={popupInfo.longitude}
      latitude={popupInfo.latitude}
      onClose={handlePopupClose}
      closeButton={true}
      closeOnClick={true}
      maxWidth="70vw"
    >
      <PoiContent data={popupInfo.data} />
    </Popup>
  ) : null;
}
