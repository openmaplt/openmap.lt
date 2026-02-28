import type { Feature } from "geojson";
import { SearchBox } from "@/components/SearchBox";
import { usePoiEnrichment } from "@/hooks/use-poi-enrichment";
import { getFeatureCenter } from "@/lib/poiHelpers";
import { useMapActions, useMapConfig } from "@/providers/MapProvider";

export function SearchFeature() {
  const { mapRef, setSelectedFeature: onSelectFeature } = useMapActions();
  const { activeMapProfile } = useMapConfig();
  const { enrichFeature } = usePoiEnrichment(activeMapProfile.mapType);

  const handleSearchResultSelect = async (feature: Feature) => {
    const center = getFeatureCenter(feature);
    if (center && mapRef.current?.getMap()) {
      const [lng, lat] = center;
      mapRef.current.getMap().flyTo({
        center: [lng, lat],
        zoom: 16,
        duration: 1500,
      });
      const enriched = await enrichFeature(feature);
      onSelectFeature(enriched);
    }
  };

  return <SearchBox onSelectResult={handleSearchResultSelect} />;
}
