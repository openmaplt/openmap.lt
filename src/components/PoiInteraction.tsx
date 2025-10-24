"use client";

import type { MapLayerMouseEvent, MapSourceDataEvent } from "maplibre-gl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Marker, useMap } from "react-map-gl/maplibre";
import { PoiContent } from "@/components/PoiContent";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useHashChange } from "@/hooks/use-hash-change";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getObjectId } from "@/lib/poiData";
import { getPoiFromObjectId, type PoiFeatureData } from "@/lib/poiHelpers";
import {
  formatHash,
  getMapState,
  type MapState,
  parseHash,
} from "@/lib/urlHash";

const INTERACTIVE_LAYER = "label-amenity";

export function PoiInteraction() {
  const { current: mapRef } = useMap();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [objectId, setObjectId] = useState<string | undefined>(() => {
    const parsedHash = parseHash(window.location.hash);
    return parsedHash?.objectId;
  });

  const [poiData, setPoiData] = useState<PoiFeatureData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Update URL hash when objectId changes
  useEffect(() => {
    const mapState = getMapState();
    const hashData: MapState = {
      ...mapState,
      objectId,
    };
    window.history.replaceState(null, "", formatHash(hashData));
  }, [objectId]);

  // Handle click on POI and map canvas clicks
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    // Handle clicks on empty canvas (not on POI) - close the sheet
    const handleMapClick = (e: MapLayerMouseEvent) => {
      // Check if we clicked on a POI layer feature
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
      map.once("styledata", setupEventHandlers);
    }

    return () => {
      if (map.getLayer(INTERACTIVE_LAYER)) {
        map.off("click", handleMapClick);
        map.off("mouseenter", INTERACTIVE_LAYER, handleMouseEnter);
        map.off("mouseleave", INTERACTIVE_LAYER, handleMouseLeave);
      }
    };
  }, [mapRef]);

  // Handle object ID changes from URL
  useEffect(() => {
    if (!objectId) {
      setIsOpen(false);
      setPoiData(null);
      return;
    }

    const map = mapRef?.getMap();
    if (!map) return;

    const displayPoi = () => {
      const poiFeature = getPoiFromObjectId(map, objectId);
      if (poiFeature) {
        setPoiData(poiFeature);
        setIsOpen(true);
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
  }, [objectId, mapRef]);

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

  const poiTitle = useMemo(
    () => poiData?.data.attributes.find((attr) => attr.type === "name")?.value,
    [poiData],
  );

  return (
    <>
      {poiData?.coordinates && (
        <Marker
          longitude={poiData.coordinates.longitude}
          latitude={poiData.coordinates.latitude}
        />
      )}
      <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <SheetContent
          side={isDesktop ? "left" : "bottom"}
          className="overflow-y-auto gap-1"
          preventOutsideClose
        >
          <SheetHeader>
            <SheetTitle className="text-lg text-foreground mr-5">
              {poiTitle || "POI informacija"}
            </SheetTitle>
          </SheetHeader>
          {poiData && <PoiContent data={poiData.data} />}
        </SheetContent>
      </Sheet>
    </>
  );
}
