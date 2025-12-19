"use client";

import type { Feature } from "geojson";
import type { LngLatBounds, MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
import { PlacesFilter } from "@/components/PlacesFilter";
import { PLACE_ICONS } from "@/config/places-icons";
import { useMapIcons } from "@/hooks/use-map-icons";
import { usePlaces } from "@/hooks/use-places";

interface PlacesFeatureProps {
  bbox: LngLatBounds | null;
  onSelectFeature: (feature: Feature | null) => void;
  mobileActiveMode: "search" | "filter" | null;
  setMobileActiveMode: (mode: "search" | "filter" | null) => void;
  poiId?: string | null;
}

export function PlacesFeature({
  bbox,
  onSelectFeature,
  mobileActiveMode,
  setMobileActiveMode,
  poiId,
}: PlacesFeatureProps) {
  const { current: mapRef } = useMap();
  const [filterTypes, setFilterTypes] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return localStorage.getItem("placesFilterTypes") || "";
  });

  // Save filter types to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("placesFilterTypes", filterTypes);
  }, [filterTypes]);

  // Register icons
  useMapIcons();

  // Fetch places based on bbox and filter types
  const { places } = usePlaces(bbox, filterTypes);

  // Handle map events for the layer
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const onLayerClick = (e: MapLayerMouseEvent) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        onSelectFeature(feature as Feature);
      }
    };

    const onMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const onMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const setupEventHandlers = () => {
      if (poiId && map.getSource("places-source")) {
        const features = map
          .querySourceFeatures("places-source")
          .filter((f) => f.id === Number.parseInt(poiId, 10));
        if (features.length > 0) {
          onSelectFeature(features[0]);
        }
      }
    };

    if (map.isStyleLoaded()) {
      setupEventHandlers();
    } else {
      map.on("sourcedata", setupEventHandlers);
    }

    map.on("click", "places-layer", onLayerClick);
    map.on("mouseenter", "places-layer", onMouseEnter);
    map.on("mouseleave", "places-layer", onMouseLeave);

    return () => {
      map.off("click", "places-layer", onLayerClick);
      map.off("mouseenter", "places-layer", onMouseEnter);
      map.off("mouseleave", "places-layer", onMouseLeave);
      map.off("sourcedata", setupEventHandlers);
    };
  }, [mapRef, onSelectFeature, poiId]);

  // Construct match expression for icon-image
  // ['match', ['get', 'TYPE'], 'CAF', 'icon-CAF', 'FUE', 'icon-FUE', ..., 'icon-default']
  const iconImageExpression = [
    "match",
    ["get", "TYPE"],
    ...Object.keys(PLACE_ICONS).flatMap((type) => [type, `icon-${type}`]),
    "icon-default",
  ];

  return (
    <>
      <PlacesFilter
        selectedTypes={filterTypes}
        onTypesChange={setFilterTypes}
        mobileActiveMode={mobileActiveMode}
        setMobileActiveMode={setMobileActiveMode}
      />
      <Source id="places-source" type="geojson" data={places}>
        <Layer
          id="places-layer"
          type="symbol"
          layout={{
            // biome-ignore lint/suspicious/noExplicitAny: The maplibre-gl type for icon-image allows for complex expressions which are typed as `any` in the current context.
            "icon-image": iconImageExpression as any,
            "icon-size": 1,
            "icon-allow-overlap": true,
          }}
          {...(poiId && {
            filter: ["!=", ["id"], poiId],
          })}
        />
      </Source>
    </>
  );
}
