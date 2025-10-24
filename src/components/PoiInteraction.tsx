"use client";

import type { MapLayerMouseEvent } from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import { PoiContent } from "@/components/PoiContent";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useHashChange } from "@/hooks/use-hash-change";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePoiMarker } from "@/hooks/use-poi-marker";
import { extractPoiData, getObjectId, type PoiData } from "@/lib/poiData";
import { getPoiFromObjectId } from "@/lib/poiHelpers";
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
  const { createMarker, removeMarker } = usePoiMarker();
  const hasProcessedInitialObjectId = useRef(false);

  // Update URL hash when objectId changes
  useEffect(() => {
    const mapState = getMapState();
    const hashData: MapState = {
      ...mapState,
      objectId,
    };
    window.history.replaceState(null, "", formatHash(hashData));
  }, [objectId]);

  // Handle POI display from object ID
  const showPoi = useCallback(
    (objId: string) => {
      const map = mapRef?.getMap();
      if (!map || !map.isStyleLoaded()) {
        return;
      }

      const poiFeature = getPoiFromObjectId(map, objId);
      if (poiFeature) {
        const { data, coordinates } = poiFeature;
        createMarker(map, coordinates[0], coordinates[1]);
        setPoiData(data);
        setIsOpen(true);
      }
    },
    [mapRef, createMarker],
  );

  // Handle sheet close
  const handleSheetClose = useCallback(() => {
    setIsOpen(false);
    setPoiData(null);
    setObjectId(undefined);
    removeMarker();
  }, [removeMarker]);

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

      // Create marker
      createMarker(map, coordinates[0], coordinates[1]);

      // Set POI data and open sheet
      setPoiData(data);
      setIsOpen(true);

      // Update URL with object ID
      const objId = getObjectId(properties, feature.layer.id);
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
        map.on("click", INTERACTIVE_LAYER, handleClick);
        map.on("mouseenter", INTERACTIVE_LAYER, handleMouseEnter);
        map.on("mouseleave", INTERACTIVE_LAYER, handleMouseLeave);
        return true;
      }
      return false;
    };

    if (map.isStyleLoaded()) {
      setupEventHandlers();
    } else {
      map.once("styledata", setupEventHandlers);
    }

    return () => {
      if (map.getLayer(INTERACTIVE_LAYER)) {
        map.off("click", INTERACTIVE_LAYER, handleClick);
        map.off("mouseenter", INTERACTIVE_LAYER, handleMouseEnter);
        map.off("mouseleave", INTERACTIVE_LAYER, handleMouseLeave);
      }
    };
  }, [mapRef, createMarker]);

  // Handle initial object ID from URL
  useEffect(() => {
    if (objectId && !hasProcessedInitialObjectId.current) {
      setTimeout(() => showPoi(objectId), 500);
      hasProcessedInitialObjectId.current = true;
    }
  }, [objectId, showPoi]);

  // Listen for hash changes to update object ID
  useHashChange(
    useCallback(() => {
      const newState = parseHash(window.location.hash);
      const newObjectId = newState?.objectId;

      if (newObjectId !== objectId) {
        setObjectId(newObjectId);
        if (newObjectId) {
          showPoi(newObjectId);
        } else {
          handleSheetClose();
        }
      }
    }, [objectId, showPoi, handleSheetClose]),
  );

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleSheetClose();
        }
      }}
    >
      <SheetContent
        side={isDesktop ? "left" : "bottom"}
        className="overflow-y-auto gap-1"
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
