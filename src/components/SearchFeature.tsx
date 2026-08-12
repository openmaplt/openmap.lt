import type { Feature } from "geojson";
import { SearchBox } from "@/components/SearchBox";
import { getPoiInfo } from "@/data/poiInfo";
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

  // AI chat search results (src/components/AiSearchChat.tsx) carry no
  // geometry over the LLM stream — only an id, so this calls getPoiInfo
  // directly (not enrichFeature, which trusts the geometry of the feature
  // passed to it — we have none here). The camera is still driven by the
  // same setSelectedFeature.
  const handleAiPoiSelect = async (id: string) => {
    const info = await getPoiInfo(id, activeMapProfile.mapType);
    if (!info?.properties || !info.geometry) return;

    onSelectFeature({
      type: "Feature",
      id,
      geometry: info.geometry,
      properties: { ...info.properties, id },
      ...(info.extent ? { extent: info.extent } : {}),
      flyToZoom: SEARCH_RESULT_ZOOM,
    });
  };

  return (
    <SearchBox
      onSelectResult={handleSearchResultSelect}
      onSelectPoiId={handleAiPoiSelect}
    />
  );
}
