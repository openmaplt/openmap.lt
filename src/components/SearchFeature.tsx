import type { Feature } from "geojson";
import { SearchBox } from "@/components/SearchBox";
import { usePoiEnrichment } from "@/hooks/use-poi-enrichment";
import { useMapActions, useMapConfig } from "@/providers/MapProvider";

// Paieškos rezultatai dažniausiai yra taškai (adresai) be apimties, tad
// nurodom į kokį zoom priartinti – kitaip žemėlapis liktų ten, kur buvo.
const SEARCH_RESULT_ZOOM = 16;

export function SearchFeature() {
  const { setSelectedFeature: onSelectFeature } = useMapActions();
  const { activeMapProfile } = useMapConfig();
  const { enrichFeature } = usePoiEnrichment(activeMapProfile.mapType);

  const handleSearchResultSelect = async (feature: Feature) => {
    const enriched = await enrichFeature(feature);
    if (!enriched) return;

    // Kamerą judina PoiDetails: `flyToZoom` – intencijos žyma, kad pasirinkus
    // paieškos rezultatą reikia priartinti. Jei feature turi `extent` –
    // PoiDetails jį sutalpins, kitaip priartins iki šio zoom. Atskiras `flyTo`
    // čia konfliktuotų su PoiDetails kameros judesiu ir zoom būtų prarastas.
    onSelectFeature({ ...enriched, flyToZoom: SEARCH_RESULT_ZOOM });
  };

  return <SearchBox onSelectResult={handleSearchResultSelect} />;
}
