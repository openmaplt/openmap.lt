"use client";

import type { MapLayerMouseEvent } from "maplibre-gl";
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

const INTERACTIVE_LAYER = "label-amenity";

export function PoiInteraction() {
  const { current: map } = useMap();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [objectId, setObjectId] = useState<string | undefined>(() => {
    const parsedHash = parseHash(window.location.hash);
    return parsedHash?.objectId;
  });

  const [poiData, setPoiData] = useState<PoiData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
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

      const properties = feature.properties;

      // Extract POI data
      const data = extractPoiData(properties);

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
  }, [map]);

  // Handle sheet close
  const handleSheetClose = () => {
    setIsOpen(false);
    setPoiData(null);
    setObjectId(undefined);
  };

  // Handle initial object ID from URL
  useEffect(() => {
    if (!objectId || hasProcessedInitialObjectId.current || !map) {
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

      // Wait a bit for layers to be ready
      setTimeout(() => {
        const features = map.queryRenderedFeatures({
          layers: [layerId],
          filter: ["==", "id", featureId],
        });

        if (features.length > 0) {
          const feature = features[0];
          const properties = feature.properties;

          const data = extractPoiData(properties);

          setPoiData(data);
          setIsOpen(true);

          hasProcessedInitialObjectId.current = true;
        }
      }, 500);
    };

    if (map.isStyleLoaded()) {
      showSheet();
    } else {
      // Otherwise, wait for style to load
      map.once("styledata", showSheet);
    }

    const handleHashChange = () => {
      hasProcessedInitialObjectId.current = false;
      const newState = parseHash(window.location.hash);
      setObjectId(newState?.objectId);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [objectId, map]);

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
