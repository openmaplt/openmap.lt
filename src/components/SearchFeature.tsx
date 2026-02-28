import type { Feature } from "geojson";
import { useMap } from "react-map-gl/maplibre";
import { SearchBox } from "@/components/SearchBox";
import { usePoiEnrichment } from "@/hooks/use-poi-enrichment";
import { getFeatureCenter } from "@/lib/poiHelpers";

interface SearchFeatureProps {
  mapCenter: { lat: number; lng: number };
  onSelectFeature: (feature: Feature | null) => void;
  mobileActiveMode: "search" | "filter" | null;
  setMobileActiveMode: (mode: "search" | "filter" | null) => void;
  mapType?: string | null;
}

export function SearchFeature({
  mapCenter,
  onSelectFeature,
  mobileActiveMode,
  setMobileActiveMode,
  mapType,
}: SearchFeatureProps) {
  const { current: mapRef } = useMap();
  const { enrichFeature } = usePoiEnrichment(mapType);

  const handleSearchResultSelect = async (feature: Feature) => {
    const center = getFeatureCenter(feature);
    if (center && mapRef?.getMap()) {
      const [lng, lat] = center;
      mapRef.getMap().flyTo({
        center: [lng, lat],
        zoom: 16,
        duration: 1500,
      });
      const enriched = await enrichFeature(feature);
      onSelectFeature(enriched);
    }
  };

  return (
    <SearchBox
      mapCenter={mapCenter}
      onSelectResult={handleSearchResultSelect}
      mobileActiveMode={mobileActiveMode}
      setMobileActiveMode={setMobileActiveMode}
      mapType={mapType}
    />
  );
}
