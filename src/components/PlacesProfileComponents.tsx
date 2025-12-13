import type { Feature } from "geojson";
import type { LngLatBounds } from "react-map-gl/maplibre";
import { PlacesFeature } from "@/components/PlacesFeature";
import { SearchFeature } from "@/components/SearchFeature";

type PlacesWithSearchFeatureProps = {
  bbox: LngLatBounds | null;
  onSelectFeature: (feature: Feature | null) => void;
  selectedFeature: Feature | null;
  mobileActiveMode: "search" | "filter" | null;
  setMobileActiveMode: (mode: "search" | "filter" | null) => void;
  mapCenter: { lat: number; lng: number };
};

export function PlacesWithSearchFeature({
  bbox,
  onSelectFeature,
  selectedFeature,
  mobileActiveMode,
  setMobileActiveMode,
  mapCenter,
}: PlacesWithSearchFeatureProps) {
  return (
    <>
      <SearchFeature
        mapCenter={mapCenter}
        selectedFeature={selectedFeature}
        onSelectFeature={onSelectFeature}
        mobileActiveMode={mobileActiveMode}
        setMobileActiveMode={setMobileActiveMode}
      />
      <PlacesFeature
        bbox={bbox}
        onSelectFeature={onSelectFeature}
        selectedFeature={selectedFeature}
        mobileActiveMode={mobileActiveMode}
        setMobileActiveMode={setMobileActiveMode}
      />
    </>
  );
}
