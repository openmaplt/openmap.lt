"use client";

import bbox from "@turf/bbox";
import center from "@turf/center";
import type { LngLatBoundsLike } from "maplibre-gl";
import { useEffect, useMemo } from "react";
import { MapConfig } from "@/config/config";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMapActions, useMapSelection } from "@/providers/MapProvider";

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
    const offset: [number, number] = isMobile
      ? [0, -Math.round(window.innerHeight * 0.2)]
      : [192, 0];

    if (extent && (isArea || flyToZoom !== undefined)) {
      map.fitBounds(extent, {
        offset,
        padding: 50,
        maxZoom: MapConfig.MAX_ZOOM,
        duration: 1200,
      });
    } else if (flyToZoom !== undefined) {
      map.flyTo({
        center: [lng, lat],
        offset,
        zoom: flyToZoom,
        duration: 1200,
      });
    } else {
      map.panTo([lng, lat], { offset, duration: 500 });
    }
  }, [lng, lat, isMobile, mapRef, flyToZoom, extent, isArea]);
}
