"use client";

import type { FilterSpecification } from "@maplibre/maplibre-gl-style-spec";
import { useEffect } from "react";
import { useMapActions, useMapSelection } from "@/providers/MapProvider";

const FILL_LAYER = "feature-highlight-fill";
const LINE_LAYER = "feature-highlight-line";
const HIGHLIGHT_COLOR = "#2563eb";

/**
 * Highlights the selected feature with a soft blue overlay drawn from the same
 * vector tiles it came from — a translucent fill plus an outline, matched by the
 * feature's `id`. It's additive, so it never disturbs the base style, and fully
 * generic: any profile whose interactive layer yields a non-point feature
 * (protected areas, rivers, …) gets highlighted with no per-profile config.
 * Point features aren't highlighted and keep their marker.
 */
export function useFeatureHighlight() {
  const { mapRef } = useMapActions();
  const { selectedFeature } = useMapSelection();

  const geometryType = selectedFeature?.geometry?.type;
  const isArea =
    geometryType === "Polygon" ||
    geometryType === "MultiPolygon" ||
    geometryType === "LineString" ||
    geometryType === "MultiLineString";
  const source = isArea ? selectedFeature?.source : undefined;
  const sourceLayer = isArea ? selectedFeature?.sourceLayer : undefined;
  const featureId = isArea
    ? (selectedFeature?.properties?.id ?? selectedFeature?.id)
    : undefined;

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const remove = () => {
      if (map.getLayer(LINE_LAYER)) map.removeLayer(LINE_LAYER);
      if (map.getLayer(FILL_LAYER)) map.removeLayer(FILL_LAYER);
    };

    const add = () => {
      remove();
      if (!source || !sourceLayer || featureId == null) return;
      const filter = [
        "==",
        ["to-string", ["get", "id"]],
        String(featureId),
      ] as FilterSpecification;
      // Fill renders for polygons (nothing for lines); the line draws the
      // outline for polygons and the highlight for line features.
      map.addLayer({
        id: FILL_LAYER,
        type: "fill",
        source,
        "source-layer": sourceLayer,
        filter,
        paint: { "fill-color": HIGHLIGHT_COLOR, "fill-opacity": 0.2 },
      });
      map.addLayer({
        id: LINE_LAYER,
        type: "line",
        source,
        "source-layer": sourceLayer,
        filter,
        paint: { "line-color": HIGHLIGHT_COLOR, "line-width": 3 },
      });
    };

    if (map.isStyleLoaded()) add();
    else map.once("load", add);
    // A base-style switch drops our layers, so re-add them once it reloads.
    const onStyle = () => {
      if (!map.getLayer(FILL_LAYER)) add();
    };
    map.on("styledata", onStyle);

    return () => {
      map.off("styledata", onStyle);
      remove();
    };
  }, [mapRef, source, sourceLayer, featureId]);
}
