"use client";

import type { Feature, Point } from "geojson";
import type { LngLatBounds, MapLayerMouseEvent } from "maplibre-gl";
import { useEffect, useState } from "react";
import { Layer, Popup, Source, useMap } from "react-map-gl/maplibre";
import { PlacesFilter } from "@/components/PlacesFilter";
import { PoiDetailsSheet } from "@/components/PoiDetailsSheet";
import { PLACE_ICONS } from "@/config/places-icons";
import { useMapIcons } from "@/hooks/use-map-icons";
import { usePlaces } from "@/hooks/use-places";
import { extractPoiData } from "@/lib/poiData";

interface PlacesFeatureProps {
  bbox: LngLatBounds | null;
}

export function PlacesFeature({ bbox }: PlacesFeatureProps) {
  const [filterTypes, setFilterTypes] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<Feature | null>(null);
  const { current: mapRef } = useMap();

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
        setSelectedFeature(feature as Feature);
      }
    };

    const onMouseEnter = (e: MapLayerMouseEvent) => {
      map.getCanvas().style.cursor = "pointer";
      if (e.features && e.features.length > 0) {
        setHoveredFeature(e.features[0] as Feature);
      }
    };

    const onMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      setHoveredFeature(null);
    };

    map.on("click", "places-layer", onLayerClick);
    map.on("mouseenter", "places-layer", onMouseEnter);
    map.on("mouseleave", "places-layer", onMouseLeave);

    return () => {
      map.off("click", "places-layer", onLayerClick);
      map.off("mouseenter", "places-layer", onMouseEnter);
      map.off("mouseleave", "places-layer", onMouseLeave);
    };
  }, [mapRef]);

  // Convert Feature properties to PoiData for display
  const getPoiData = (feature: Feature) => {
    const properties = feature.properties || {};
    return {
      data: extractPoiData(properties),
      name: properties.name || "Be pavadinimo",
    };
  };

  const getFeatureCoordinates = (feature: Feature): [number, number] | null => {
    if (feature.geometry.type === "Point") {
      return (feature.geometry as Point).coordinates as [number, number];
    }
    return null;
  };

  const hoveredCoords = hoveredFeature
    ? getFeatureCoordinates(hoveredFeature)
    : null;

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
      />

      <Source type="geojson" data={places}>
        <Layer
          id="places-layer"
          type="symbol"
          layout={{
            // biome-ignore lint/suspicious/noExplicitAny: The maplibre-gl type for icon-image allows for complex expressions which are typed as `any` in the current context.
            "icon-image": iconImageExpression as any,
            "icon-size": 1,
            "icon-allow-overlap": true,
          }}
        />
      </Source>

      {hoveredFeature && hoveredCoords && (
        <Popup
          longitude={hoveredCoords[0]}
          latitude={hoveredCoords[1]}
          closeButton={false}
          closeOnClick={false}
          anchor="bottom"
          offset={16}
        >
          <span className="text-primary font-semibold">
            {hoveredFeature.properties?.name || "Be pavadinimo"}
          </span>
        </Popup>
      )}

      <PoiDetailsSheet
        open={!!selectedFeature}
        onOpenChange={(open) => !open && setSelectedFeature(null)}
        title={selectedFeature ? getPoiData(selectedFeature).name : ""}
        data={
          selectedFeature
            ? getPoiData(selectedFeature).data
            : { attributes: [] }
        }
      />
    </>
  );
}
