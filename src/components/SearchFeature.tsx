import { point } from "@turf/helpers";
import type { Feature } from "geojson";
import { useCallback, useState } from "react";
import {
  AiSearchChat,
  type AiSearchRoutePayload,
} from "@/components/AiSearchChat";
import { SearchBox } from "@/components/SearchBox";
import { getPoiInfo } from "@/data/poiInfo";
import { usePoiEnrichment } from "@/hooks/use-poi-enrichment";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useAuth } from "@/providers/AuthProvider";
import {
  useMapActions,
  useMapConfig,
  useMapSelection,
  useMapTransform,
} from "@/providers/MapProvider";
import { useRoute } from "@/providers/RouteProvider";

// Paieškos rezultatai dažniausiai yra taškai (adresai) be apimties, tad
// nurodom į kokį zoom priartinti – kitaip žemėlapis liktų ten, kur buvo.
const SEARCH_RESULT_ZOOM = 16;

export function SearchFeature() {
  const { setSelectedFeature: onSelectFeature, setHighlightedPoiIds } =
    useMapActions();
  const { activeMapProfile } = useMapConfig();
  const { viewState } = useMapTransform();
  const { selectedFeature } = useMapSelection();
  const { user } = useAuth();
  const {
    setRouteStart,
    setRouteEnd,
    setWaypoints,
    setSelectedRouteProfile,
    setRoutingMode,
  } = useRoute();
  const { enrichFeature } = usePoiEnrichment(activeMapProfile.mapType);
  const isMobile = useIsMobile();
  const mapType = activeMapProfile.mapType;

  const [aiChatOpen, setAiChatOpen] = useState(false);
  // Rendered as a sibling of SearchBox, not inside it — SearchBox returns
  // null while routingMode is active (it gives the route panel the screen
  // space it normally occupies), which used to unmount AiSearchChat (and
  // wipe its conversation) the moment "Rodyti maršrutą" opened the route
  // panel. Living here means it survives that.
  //
  // On mobile, the AI chat (side="right", nearly full width) covers the POI
  // details sheet (side="bottom") opened by a `poi:` link click — the user
  // can no longer see the marker on the map. `aiChatOpen` stays the user's
  // INTENT (true until they click X); `showAiChat` is the actual
  // visibility — auto-hidden on mobile while POI details are showing, and
  // restored once they close, with no loss of chat state (AiSearchChat
  // never unmounts).
  const showAiChat = aiChatOpen && !(isMobile && selectedFeature);

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

  const handleAiHighlight = useCallback(
    (ids: string[]) => setHighlightedPoiIds(ids.length > 0 ? ids : null),
    [setHighlightedPoiIds],
  );

  const handleShowRoute = (route: AiSearchRoutePayload) => {
    if (route.stops.length < 2) return;
    const stopFeatures = route.stops.map((s) =>
      point([s.lng, s.lat], { name: s.name }),
    );
    // stops[0] is the route start (nearest matched POI to the map center at
    // query time) — we don't treat that center as a real start point, since
    // it's just where the map happened to be, not the user's actual position.
    setRouteStart(stopFeatures[0]);
    setWaypoints(stopFeatures.slice(1, -1));
    setRouteEnd(stopFeatures[stopFeatures.length - 1]);
    setSelectedRouteProfile(route.profile);
    setRoutingMode(true);
  };

  return (
    <>
      <SearchBox
        onSelectResult={handleSearchResultSelect}
        onOpenAiChat={() => setAiChatOpen(true)}
      />
      {user?.isAdmin && mapType === "places" && (
        <AiSearchChat
          open={showAiChat}
          onOpenChange={setAiChatOpen}
          pos={[viewState?.longitude || 0, viewState?.latitude || 0]}
          onSelectPoiId={handleAiPoiSelect}
          onHighlightIds={handleAiHighlight}
          onShowRoute={handleShowRoute}
        />
      )}
    </>
  );
}
