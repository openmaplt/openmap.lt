"use client";

import type { LngLatBounds } from "maplibre-gl";
import { useCallback, useMemo, useState } from "react";
import { PlaceMarker } from "@/components/PlaceMarker";
import { PlacesFilter } from "@/components/PlacesFilter";
import { PoiDetailsSheet } from "@/components/PoiDetailsSheet";
import { type Place, usePlaces } from "@/hooks/use-places";
import { extractPoiData, type PoiProperties } from "@/lib/poiData";

interface PlacesFeatureProps {
  bbox: LngLatBounds | null;
}

export function PlacesFeature({ bbox }: PlacesFeatureProps) {
  const [filterTypes, setFilterTypes] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Fetch places based on bbox and filter types
  const { places } = usePlaces(bbox, filterTypes);

  // Convert Place to PoiData for display
  const getPlaceData = useCallback((place: Place) => {
    const properties: PoiProperties = {};
    place.attr.forEach((item) => {
      Object.entries(item).forEach(([key, value]) => {
        properties[key] = value;
      });
    });

    // Add ID if needed
    properties.id = place.id;

    return {
      data: extractPoiData(properties),
      name: properties.name || "Be pavadinimo",
    };
  }, []);

  const selectedPlaceData = useMemo(
    () => selectedPlace && getPlaceData(selectedPlace),
    [selectedPlace, getPlaceData],
  );

  return (
    <>
      <PlacesFilter
        selectedTypes={filterTypes}
        onTypesChange={setFilterTypes}
      />
      {places.map((place) => (
        <PlaceMarker key={place.id} place={place} onClick={setSelectedPlace} />
      ))}

      {selectedPlaceData && (
        <PoiDetailsSheet
          open={true}
          onOpenChange={(open) => !open && setSelectedPlace(null)}
          title={selectedPlaceData.name}
          data={selectedPlaceData.data}
        />
      )}
    </>
  );
}
