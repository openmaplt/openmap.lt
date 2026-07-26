"use client";

import bbox from "@turf/bbox";
import center from "@turf/center";
import type { LngLatBoundsLike, PaddingOptions } from "maplibre-gl";
import { useEffect, useMemo } from "react";
import { MapConfig } from "@/config/config";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMapActions, useMapSelection } from "@/providers/MapProvider";

// Matches PoiDetails' collapsed sheet height (40dvh). fitBounds/flyTo/panTo
// size the frame against the full container, so simply offsetting the
// center upward (as before) still let the far edge of a large polygon end
// up under the sheet — padding the bottom edge shrinks the usable frame
// itself, keeping the whole feature above the sheet.
const MOBILE_SHEET_HEIGHT_RATIO = 0.4;

/**
 * Moves the camera to the selected feature, keeping it clear of the details
 * panel (offset left on desktop, up on mobile):
 *  • an object with extent (polygon/line, or a search result carrying `extent`)
 *    → fit the whole extent;
 *  • a search point without extent (address) → fly to its `flyToZoom`;
 *  • a click / deep-link point → just pan, keeping the current zoom.
 */
export function useSelectionCamera() {
  const { mapRef } = useMapActions();
  const { selectedFeature: feature } = useMapSelection();
  const isMobile = useIsMobile();

  const geomType = feature?.geometry?.type;
  const isArea =
    geomType === "Polygon" ||
    geomType === "MultiPolygon" ||
    geomType === "LineString" ||
    geomType === "MultiLineString";
  const flyToZoom = feature?.flyToZoom;

  // turf throws on geometries it doesn't recognise (some DB features come with
  // an odd/absent geometry), so tolerate that and just skip the camera move.
  let coords: number[] | null = null;
  if (feature?.geometry) {
    try {
      coords = center(feature).geometry.coordinates;
    } catch {
      coords = null;
    }
  }
  const lng = coords?.[0];
  const lat = coords?.[1];

  const extent = useMemo<LngLatBoundsLike | undefined>(() => {
    if (!feature) return undefined;
    if (feature.extent) return feature.extent;
    if (!isArea) return undefined;
    try {
      return bbox(feature) as [number, number, number, number];
    } catch {
      return undefined;
    }
  }, [feature, isArea]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || lng === undefined || lat === undefined) return;
    const offset: [number, number] = isMobile ? [0, 0] : [192, 0];
    const padding: PaddingOptions = isMobile
      ? {
          top: 50,
          bottom:
            Math.round(window.innerHeight * MOBILE_SHEET_HEIGHT_RATIO) + 50,
          left: 50,
          right: 50,
        }
      : { top: 50, bottom: 50, left: 50, right: 50 };

    if (extent && (isArea || flyToZoom !== undefined)) {
      map.fitBounds(extent, {
        offset,
        padding,
        maxZoom: MapConfig.MAX_ZOOM,
        duration: 1200,
      });
    } else if (flyToZoom !== undefined) {
      map.flyTo({
        center: [lng, lat],
        offset,
        padding,
        zoom: flyToZoom,
        duration: 1200,
      });
    } else {
      map.panTo([lng, lat], { offset, padding, duration: 500 });
    }
  }, [lng, lat, isMobile, mapRef, flyToZoom, extent, isArea]);
}
