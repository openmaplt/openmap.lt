import type { Feature } from "geojson";
import type { LngLatBounds } from "react-map-gl/maplibre";
import { PlacesFeature } from "@/components/PlacesFeature";
import { SearchFeature } from "@/components/SearchFeature";
import { SelectedPlaceMarker } from "@/components/SelectedPlaceMarker";

type ProtectedProfileComponents = {
  bbox: LngLatBounds | null;
  onSelectFeature: (feature: Feature | null) => void;
  selectedFeature: Feature | null;
  mobileActiveMode: "search" | "filter" | null;
  setMobileActiveMode: (mode: "search" | "filter" | null) => void;
  mapCenter: { lat: number; lng: number };
  poiId?: string | null;
  initialFilterType?: string;
};

export function ProtectedProfileComponents({
  bbox,
  onSelectFeature,
  selectedFeature,
  mobileActiveMode,
  setMobileActiveMode,
  mapCenter,
  poiId,
  initialFilterType,
}: ProtectedProfileComponents) {
  return (
    <>
      <SearchFeature
        mapCenter={mapCenter}
        onSelectFeature={onSelectFeature}
        mobileActiveMode={mobileActiveMode}
        setMobileActiveMode={setMobileActiveMode}
      />
      <PlacesFeature
        bbox={bbox}
        onSelectFeature={onSelectFeature}
        mobileActiveMode={mobileActiveMode}
        setMobileActiveMode={setMobileActiveMode}
        poiId={poiId}
        initialFilterType={initialFilterType}
      />
      {selectedFeature && <SelectedPlaceMarker feature={selectedFeature} />}
    </>
  );
}
