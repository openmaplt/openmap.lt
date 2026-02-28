import type { Feature } from "geojson";
import type { LngLatBounds } from "react-map-gl/maplibre";
import { PlacesFeature } from "@/components/PlacesFeature";
import { SearchFeature } from "@/components/SearchFeature";
import { SelectedPlaceMarker } from "@/components/SelectedPlaceMarker";

type PlacesProfileComponents = {
  bbox: LngLatBounds | null;
  onSelectFeature: (feature: Feature | null) => void;
  selectedFeature: Feature | null;
  mobileActiveMode: "search" | "filter" | null;
  setMobileActiveMode: (mode: "search" | "filter" | null) => void;
  mapCenter: { lat: number; lng: number };
  poiId?: string | null;
  initialFilterType?: string;
  mapType?: string | null;
};

export function PlacesProfileComponents({
  bbox,
  onSelectFeature,
  selectedFeature,
  mobileActiveMode,
  setMobileActiveMode,
  mapCenter,
  poiId,
  initialFilterType,
  mapType,
}: PlacesProfileComponents) {
  return (
    <>
      <SearchFeature
        mapCenter={mapCenter}
        onSelectFeature={onSelectFeature}
        mobileActiveMode={mobileActiveMode}
        setMobileActiveMode={setMobileActiveMode}
        mapType={mapType}
      />
      <PlacesFeature
        bbox={bbox}
        onSelectFeature={onSelectFeature}
        mobileActiveMode={mobileActiveMode}
        setMobileActiveMode={setMobileActiveMode}
        poiId={poiId}
        initialFilterType={initialFilterType}
        mapType={mapType}
      />
      {selectedFeature && <SelectedPlaceMarker feature={selectedFeature} />}
    </>
  );
}
