"use client";

import type { Feature } from "geojson";
import type { LngLatBounds } from "maplibre-gl";
import { useEffect, useState } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
import { PlacesFilter } from "@/components/PlacesFilter";
import { PLACE_ICONS } from "@/config/places-icons";
import { useMapIcons } from "@/hooks/use-map-icons";
import { usePlaces } from "@/hooks/use-places";
import { usePoiEnrichment } from "@/hooks/use-poi-enrichment";

interface PlacesFeatureProps {
  bbox: LngLatBounds | null;
  onSelectFeature: (feature: Feature | null) => void;
  mobileActiveMode: "search" | "filter" | null;
  setMobileActiveMode: (mode: "search" | "filter" | null) => void;
  poiId?: string | null;
  initialFilterType?: string;
}

export function PlacesFeature({
  bbox,
  onSelectFeature,
  mobileActiveMode,
  setMobileActiveMode,
  poiId,
  initialFilterType,
}: PlacesFeatureProps) {
  const { current: mapRef } = useMap();
  const [filterTypes, setFilterTypes] = useState(() => {
    const typesFromLocalStorage =
      localStorage.getItem("placesFilterTypes") || "";
    const typeByPoi = initialFilterType ?? "";

    return typesFromLocalStorage.includes(typeByPoi)
      ? typesFromLocalStorage
      : `${typeByPoi}${typesFromLocalStorage}`;
  });

  // Save filter types to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("placesFilterTypes", filterTypes);
  }, [filterTypes]);

  // Register icons
  useMapIcons();

  // Fetch places based on bbox and filter types
  const { places } = usePlaces(bbox, filterTypes);
  const { enrichFeature } = usePoiEnrichment();

  // Handle map events for the layer
  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const setupInitialSelection = async () => {
      if (poiId && map.getSource("places-source")) {
        const features = map
          .querySourceFeatures("places-source")
          .filter((f) => f.id === Number.parseInt(poiId, 10));
        if (features.length > 0) {
          const enriched = await enrichFeature(features[0] as Feature);
          onSelectFeature(enriched);
        }
      }
    };

    if (map.isStyleLoaded()) {
      setupInitialSelection();
    } else {
      map.on("sourcedata", setupInitialSelection);
    }

    return () => {
      map.off("sourcedata", setupInitialSelection);
    };
  }, [mapRef, onSelectFeature, poiId, enrichFeature]);

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
            filter: ["!=", ["id"], Number.parseInt(poiId, 10)],
          })}
        />
      </Source>
    </>
  );
}
