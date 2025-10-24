"use client";

import type { MapLayerMouseEvent } from "maplibre-gl";
import { useCallback, useEffect, useState } from "react";
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

  // Update URL hash when objectId changes
  useEffect(() => {
    const mapState = getMapState();
    const hashData: MapState = {
      ...mapState,
      objectId,
    };
    window.history.replaceState(null, "", formatHash(hashData));
  }, [objectId]);

  // Handle sheet close
  const handleSheetClose = useCallback(() => {
    setIsOpen(false);
    setPoiData(null);
    setObjectId(undefined);
    removeMarker();
  }, [removeMarker]);

  // Handle click on POI and map canvas clicks
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const handlePoiClick = (e: MapLayerMouseEvent) => {
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

    // Handle clicks on empty canvas (not on POI) - close the sheet
    const handleMapClick = (e: MapLayerMouseEvent) => {
      // Check if we clicked on a POI layer feature
      const features = map.queryRenderedFeatures(e.point, {
        layers: [INTERACTIVE_LAYER],
      });
      
      // If no POI features at this point and sheet is open, close it
      if (features.length === 0 && isOpen) {
        handleSheetClose();
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
        map.on("click", INTERACTIVE_LAYER, handlePoiClick);
        map.on("click", handleMapClick); // Listen to all map clicks
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
        map.off("click", INTERACTIVE_LAYER, handlePoiClick);
        map.off("click", handleMapClick);
        map.off("mouseenter", INTERACTIVE_LAYER, handleMouseEnter);
        map.off("mouseleave", INTERACTIVE_LAYER, handleMouseLeave);
      }
    };
  }, [mapRef, createMarker, isOpen, handleSheetClose]);

  // Handle object ID changes (from URL or clicks)
  useEffect(() => {
    if (!objectId) {
      removeMarker();
      setIsOpen(false);
      setPoiData(null);
      return;
    }

    // Wait for map to be ready and layers to load
    const map = mapRef?.getMap();
    if (!map) return;

    const displayPoi = () => {
      if (!map.isStyleLoaded()) {
        return;
      }

      const poiFeature = getPoiFromObjectId(map, objectId);
      if (poiFeature) {
        const { data, coordinates } = poiFeature;
        createMarker(map, coordinates[0], coordinates[1]);
        setPoiData(data);
        setIsOpen(true);
      }
    };

    if (map.isStyleLoaded()) {
      // Small delay to ensure layers are queryable after hash change
      setTimeout(displayPoi, 50);
    } else {
      map.once("styledata", () => {
        setTimeout(displayPoi, 50);
      });
    }
  }, [objectId, mapRef, createMarker, removeMarker]);

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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side={isDesktop ? "left" : "bottom"}
        className="overflow-y-auto gap-1"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking on map canvas
          // The map click handler will handle POI clicks and empty canvas clicks
          const target = e.target as HTMLElement;
          if (target.closest(".mapboxgl-canvas")) {
            e.preventDefault();
            return;
          }
          // Clicking on the sheet overlay (true outside) closes the sheet
          handleSheetClose();
        }}
        onEscapeKeyDown={() => {
          handleSheetClose();
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
