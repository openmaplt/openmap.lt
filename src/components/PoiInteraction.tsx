"use client";

import type { MapLayerMouseEvent } from "maplibre-gl";
import { Marker } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import { PoiContent } from "@/components/PoiContent";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
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
  const { current: mapRef } = useMap();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [objectId, setObjectId] = useState<string | undefined>(() => {
    const parsedHash = parseHash(window.location.hash);
    return parsedHash?.objectId;
  });

  const [poiData, setPoiData] = useState<PoiData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const markerRef = useRef<Marker | null>(null);
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
    const map = mapRef?.getMap();
    if (!map) return;

    const handleClick = (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const properties = feature.properties;
      const coordinates = (
        feature.geometry as PointGeometry
      ).coordinates.slice();

      // Extract POI data
      const data = extractPoiData(properties);

      // Remove existing marker if any
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Create and add marker at POI location
      const markerElement = document.createElement("div");
      markerElement.className = "poi-marker";
      markerElement.style.width = "20px";
      markerElement.style.height = "20px";
      markerElement.style.borderRadius = "50%";
      markerElement.style.backgroundColor = "#3b82f6";
      markerElement.style.border = "3px solid white";
      markerElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
      markerElement.style.cursor = "pointer";

      const marker = new Marker({ element: markerElement })
        .setLngLat([coordinates[0], coordinates[1]])
        .addTo(map);

      markerRef.current = marker;

      // Set POI data and open sheet
      setPoiData(data);
      setIsOpen(true);

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
  }, [mapRef]);

  // Handle sheet close
  const handleSheetClose = () => {
    setIsOpen(false);
    setPoiData(null);
    setObjectId(undefined);

    // Remove marker when sheet closes
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  };

  // Handle initial object ID from URL and hash changes
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map || !map.isStyleLoaded()) {
      return;
    }

    if (!objectId) {
      // Clear marker and sheet if no object ID
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      setIsOpen(false);
      setPoiData(null);
      return;
    }

    const showSheet = () => {
      const parsedId = parseObjectId(objectId);
      if (!parsedId) {
        return;
      }

      const { layerId, featureId } = parsedId;

      if (!map.getLayer(layerId)) {
        return;
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
        ).coordinates.slice();

        const data = extractPoiData(properties);

        // Remove existing marker if any
        if (markerRef.current) {
          markerRef.current.remove();
        }

        // Create and add marker at POI location
        const markerElement = document.createElement("div");
        markerElement.className = "poi-marker";
        markerElement.style.width = "20px";
        markerElement.style.height = "20px";
        markerElement.style.borderRadius = "50%";
        markerElement.style.backgroundColor = "#3b82f6";
        markerElement.style.border = "3px solid white";
        markerElement.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
        markerElement.style.cursor = "pointer";

        const marker = new Marker({ element: markerElement })
          .setLngLat([coordinates[0], coordinates[1]])
          .addTo(map);

        markerRef.current = marker;

        setPoiData(data);
        setIsOpen(true);
      }
    };

    // Wait a bit for layers to be ready on initial load
    if (!hasProcessedInitialObjectId.current) {
      setTimeout(showSheet, 500);
      hasProcessedInitialObjectId.current = true;
    } else {
      showSheet();
    }
  }, [objectId, mapRef]);

  // Listen for hash changes to update object ID
  useEffect(() => {
    const handleHashChange = () => {
      const newState = parseHash(window.location.hash);
      setObjectId(newState?.objectId);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleSheetClose();
        }
      }}
      modal={false}
    >
      <SheetContent
        side={isDesktop ? "left" : "bottom"}
        className="overflow-y-auto gap-1"
        onInteractOutside={(e) => {
          // Prevent closing when clicking on the map
          e.preventDefault();
        }}
      >
        <SheetHeader>
          <SheetTitle className="text-lg text-foreground mr-5">
            {poiData?.attributes.find((attr) => attr.type === "name")?.value ||
              "POI informacija"}
          </SheetTitle>
        </SheetHeader>
        {poiData && <PoiContent data={poiData} />}
      </SheetContent>
    </Sheet>
  );
}
