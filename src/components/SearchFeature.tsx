import { point } from "@turf/helpers";
import type { Feature } from "geojson";
import { useCallback, useEffect, useState } from "react";
import {
  AiSearchChat,
  type AiSearchRoutePayload,
} from "@/components/AiSearchChat";
import { SearchBox } from "@/components/SearchBox";
import { getPoiInfo } from "@/data/poiInfo";
import { usePoiEnrichment } from "@/hooks/use-poi-enrichment";
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
    routingMode,
    setRouteStart,
    setRouteEnd,
    setWaypoints,
    setSelectedRouteProfile,
    setRoutingMode,
  } = useRoute();
  const { enrichFeature } = usePoiEnrichment(activeMapProfile.mapType);
  const mapType = activeMapProfile.mapType;

  const [aiChatOpen, setAiChatOpen] = useState(false);
  // Rendered as a sibling of SearchBox, not inside it — SearchBox returns
  // null while routingMode is active (it gives the route panel the screen
  // space it normally occupies), which used to unmount AiSearchChat (and
  // wipe its conversation) the moment "Rodyti maršrutą" opened the route
  // panel. Living here means it survives that.
  //
  // AiSearchChat would otherwise stack on top of the POI details sheet
  // opened by a `poi:` link click, or the route panel opened by "Rodyti
  // maršrutą" / a long-press on the map. On mobile both are full-screen
  // bottom sheets; on desktop/tablet each is a side panel capped at 384px
  // (Tailwind's sm:max-w-sm) — two of those side by side already leave
  // barely any map visible well above the 768px mobile breakpoint, so this
  // isn't just a mobile concern and isn't gated on isMobile. `aiChatOpen`
  // stays the user's INTENT (true until they click X); `showAiChat` is the
  // actual visibility — auto-hidden while either of those is showing, and
  // restored once they close, with no loss of chat state (AiSearchChat
  // never unmounts, so the conversation is never wiped).
  const showAiChat = aiChatOpen && !(selectedFeature || routingMode);

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

  // The ids the map should actually dim/brighten around are computed, not
  // imperatively set-and-later-cleared: two independent inputs — the AI
  // search result set, and (while a route built from chat is showing) that
  // route's stops — each live in their own piece of state, and a single
  // effect below pushes whichever one currently applies into
  // MapProvider's highlightedPoiIds. This used to be two separate effects
  // each manually setting AND clearing setHighlightedPoiIds with a
  // hand-rolled "is a route highlight active" flag; if that flag ever
  // desynced from the actual highlight (e.g. a route closing without its
  // effect's dependency array having changed on that exact render), the
  // route's stop ids would stay stuck in highlightedPoiIds indefinitely —
  // dimming every POI on the map, including ones that had nothing to do
  // with that route, once the user went back to the chat. A pure derivation
  // can't desync like that: there's nothing to forget to clear.
  const [aiSearchHighlightIds, setAiSearchHighlightIds] = useState<
    string[] | null
  >(null);
  const [routeStopIds, setRouteStopIds] = useState<string[] | null>(null);

  const handleAiHighlight = useCallback(
    (ids: string[]) => setAiSearchHighlightIds(ids.length > 0 ? ids : null),
    [],
  );

  // A route built from chat only stays "current" while its panel is open —
  // once routingMode goes false (RouteDetails' close button), forget its
  // stops so the derivation below falls back to the AI search highlight.
  useEffect(() => {
    if (!routingMode) setRouteStopIds(null);
  }, [routingMode]);

  // While chat intent is open, its last search highlight applies; closing
  // it (not just auto-hiding it — see showAiChat above) hides the
  // highlight too, but doesn't forget it: reopening the chat later brings
  // it right back, same as the conversation itself never gets wiped.
  const highlightedPoiIds =
    routingMode && routeStopIds
      ? routeStopIds
      : aiChatOpen
        ? aiSearchHighlightIds
        : null;

  useEffect(() => {
    setHighlightedPoiIds(highlightedPoiIds);
  }, [highlightedPoiIds, setHighlightedPoiIds]);

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
    // Same dimming mechanism PlacesFeature.tsx already applies for AI search
    // result lists (icon-opacity keyed on highlightedPoiIds) — here it makes
    // the route's own stops stand out against every other POI on the map.
    setRouteStopIds(route.stops.map((s) => s.id));
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
