"use client";

import type { Feature } from "geojson";
import { useEffect } from "react";
import type { MapProps } from "react-map-gl/maplibre";
import type { MapProfile } from "@/config/map-profiles";
import {
  formatSearchParams,
  getMapState,
  saveStateToStorage,
} from "@/lib/urlHash";
import { slugify } from "@/lib/utils";

export function useMapSync(
  viewState: MapProps["initialViewState"],
  activeMapProfile: MapProfile,
  selectedFeature: Feature | null,
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

    const url = new URL(window.location.href);
    url.pathname = `/${activeMapProfile.mapType}/${poiSlugWithName ?? "map"}`;
    url.search = formatSearchParams(mapStateData);
    url.hash = "";

    window.history.replaceState(null, "", url);
    saveStateToStorage(mapStateData);
  }, [viewState, activeMapProfile, selectedFeature]);
}
