import type { Feature } from "geojson";
import { ProtectedFeature } from "@/components/ProtectedFeature";
import { SearchFeature } from "@/components/SearchFeature";
import { SelectedPlaceMarker } from "@/components/SelectedPlaceMarker";

type ProtectedProfileComponents = {
  onSelectFeature: (feature: Feature | null) => void;
  selectedFeature: Feature | null;
  mobileActiveMode: "search" | "filter" | null;
  setMobileActiveMode: (mode: "search" | "filter" | null) => void;
  mapCenter: { lat: number; lng: number };
};

export function ProtectedProfileComponents({
  onSelectFeature,
  selectedFeature,
  mobileActiveMode,
  setMobileActiveMode,
  mapCenter,
}: ProtectedProfileComponents) {
  return (
    <>
      <SearchFeature
        mapCenter={mapCenter}
        onSelectFeature={onSelectFeature}
        mobileActiveMode={mobileActiveMode}
        setMobileActiveMode={setMobileActiveMode}
      />
      <ProtectedFeature />
      {selectedFeature && <SelectedPlaceMarker feature={selectedFeature} />}
    </>
  );
}
