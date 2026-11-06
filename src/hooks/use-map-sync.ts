"use client";

import type { Feature } from "geojson";
import { useEffect } from "react";
import type { MapProps } from "react-map-gl/maplibre";
import type { MapProfile } from "@/config/map-profiles";
import {
  formatSearchParams,
  getMapState,
  type RouteState,
  saveStateToStorage,
} from "@/lib/urlHash";
import { slugify } from "@/lib/utils";

export function useMapSync(
  viewState: MapProps["initialViewState"],
  activeMapProfile: MapProfile,
  selectedFeature: Feature | null,
  route?: RouteState | null,
) {
  useEffect(() => {
    const currentState = getMapState();

    const latitude = viewState?.latitude ?? currentState.latitude;
    const longitude = viewState?.longitude ?? currentState.longitude;
    const zoom = viewState?.zoom ?? currentState.zoom;
    const bearing = viewState?.bearing ?? currentState.bearing;
    const pitch = viewState?.pitch ?? currentState.pitch;

    const mapStateData = {
      ...currentState,
      mapType: activeMapProfile.mapType,
      latitude,
      longitude,
      zoom,
      bearing,
      pitch,
    };

    const selectedFeaturePoiId =
      selectedFeature?.properties?.id ?? selectedFeature?.id;
    const poiName = selectedFeature?.properties?.name;
    const poiSlugWithName = [
      selectedFeaturePoiId,
      poiName ? slugify(poiName) : null,
    ]
      .filter((v) => v)
      .join("-");

    document.title = poiName
      ? `${poiName} – Openmap.lt`
      : "Openmap.lt – Atviras Lietuvos žemėlapis";

    const url = new URL(window.location.href);
    url.pathname = `/${activeMapProfile.mapType}/${poiSlugWithName ?? "map"}`;
    url.search = formatSearchParams(mapStateData, route);

    // A shared `link` map needs its secret `?k=` to survive the URL rewrite
    // above, or a reload (or copying the address bar) would 404. Only the key
    // of the profile that is open: it sits in that profile's style URL (see
    // toMapProfile), so it can't leak onto another profile's URL.
    const profileKey = activeMapProfile.isCustom
      ? new URL(
          activeMapProfile.mapStyles[0].style,
          window.location.origin,
        ).searchParams.get("k")
      : null;
    if (profileKey) {
      const params = new URLSearchParams(url.search);
      params.set("k", profileKey);
      url.search = params.toString();
    }
    url.hash = "";

    window.history.replaceState(null, "", url);
    saveStateToStorage(mapStateData);
  }, [viewState, activeMapProfile, selectedFeature, route]);
}
