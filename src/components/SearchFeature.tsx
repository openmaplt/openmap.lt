import type { Feature, Point } from "geojson";
import { useMap } from "react-map-gl/maplibre";
import { SearchBox } from "@/components/SearchBox";

interface SearchFeatureProps {
  mapCenter: { lat: number; lng: number };
  onSelectFeature: (feature: Feature | null) => void;
  mobileActiveMode: "search" | "filter" | null;
  setMobileActiveMode: (mode: "search" | "filter" | null) => void;
}

export function SearchFeature({
  mapCenter,
  onSelectFeature,
  mobileActiveMode,
  setMobileActiveMode,
}: SearchFeatureProps) {
  const { current: mapRef } = useMap();

  const handleSearchResultSelect = (feature: Feature) => {
    if (feature.geometry.type === "Point" && mapRef?.getMap()) {
      const [lng, lat] = (feature.geometry as Point).coordinates;
      mapRef.getMap().flyTo({
        center: [lng, lat],
        zoom: 16,
        duration: 1500,
      });
      onSelectFeature(feature);
    }
  };

  return (
    <SearchBox
      mapCenter={mapCenter}
      onSelectResult={handleSearchResultSelect}
      mobileActiveMode={mobileActiveMode}
      setMobileActiveMode={setMobileActiveMode}
    />
  );
}
