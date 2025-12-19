"use client";

import {
  AttributionControl,
  type LngLatBounds,
  Map as MapLibreMap,
  type MapProps,
  ScaleControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Feature } from "geojson";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { CraftbeerFeature } from "@/components/CraftbeerFeature";
import { MapStyleSwitcher } from "@/components/MapStyleSwitcher";
import { PlacesFeature } from "@/components/PlacesFeature";
import { PoiDetails } from "@/components/PoiDetails";
import { PoiInteraction } from "@/components/PoiInteraction";
import { SearchFeature } from "@/components/SearchFeature";
import { SelectedPlaceMarker } from "@/components/SelectedPlaceMarker";
import { MAP_PROFILES, type MapProfile } from "@/config/map-profiles";
import { MapConfig } from "@/config/config";
import {
  formatSearchParams,
  getMapState,
  saveStateToStorage,
} from "@/lib/urlHash";
import { findMapsByType, slugify } from "@/lib/utils";

export default function Page() {
  const pathname = usePathname();
  const [, mapType, poiSlug] = pathname.split("/");
  const poiId = poiSlug !== "map" ? poiSlug?.split("-")[0] : undefined;

  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState(() => {
    const state = getMapState();
    return {
      latitude: state.latitude,
      longitude: state.longitude,
      zoom: state.zoom,
      bearing: state.bearing,
      pitch: state.pitch,
    };
  });

  const [activeMapProfile, setActiveMapProfile] = useState<MapProfile>(() => {
    const state = getMapState();
    return (
      findMapsByType(mapType.length > 0 ? mapType : state.mapType) ??
      MAP_PROFILES[0]
    );
  });
  const [bbox, setBbox] = useState<LngLatBounds | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [mobileActiveMode, setMobileActiveMode] = useState<
    "search" | "filter" | null
  >(null);
  const [selectedPoiId, setSelectedPoiId] = useState(poiId ?? null);

  useEffect(() => {
    const currentState = getMapState();
    const mapStateData = {
      ...currentState,
      mapType: activeMapProfile.mapType,
      ...viewState,
    };

    // Update URL without triggering page reload
    const poiSlugWithName = [
      selectedPoiId,
      selectedFeature?.properties?.name
        ? slugify(selectedFeature.properties?.name)
        : null,
    ]
      .filter((v) => v)
      .join("-");

    const url = new URL(window.location.href);
    url.pathname = `/${activeMapProfile.mapType}/${poiSlugWithName ?? "map"}`;
    url.search = formatSearchParams(mapStateData);
    url.hash = "";

    window.history.replaceState(null, "", url);

    // Save to localStorage as JSON
    saveStateToStorage(mapStateData);
  }, [viewState, activeMapProfile, selectedPoiId, selectedFeature]);

  useEffect(() => {
    if (selectedFeature) {
      setSelectedPoiId(selectedFeature.id ?? selectedFeature.properties?.id);
    }
  }, [selectedFeature]);

  // Update URL hash and localStorage when map moves
  const handleMoveEnd = useCallback(
    ({ viewState, target }: ViewStateChangeEvent) => {
      const { latitude, longitude, zoom, bearing, pitch } = viewState;
      setViewState({ latitude, longitude, zoom, bearing, pitch });
      setBbox(target.getBounds());
    },
    [],
  );

  const handleOnChangeMapProfile = useCallback((profile: MapProfile) => {
    setActiveMapProfile(profile);
    setSelectedPoiId(null);
    setSelectedFeature(null);
  }, []);

  const handleOnPoiDetailsClose = useCallback(() => {
    setSelectedFeature(null);
    setSelectedPoiId(null);
  }, []);

  const TypedMapLibreMap = MapLibreMap as React.ForwardRefExoticComponent<
    MapProps & React.RefAttributes<MapRef>
  >;

  const FeatureComponent =
    activeMapProfile.featureComponent &&
    {
      places: PlacesFeature,
      craftbeer: CraftbeerFeature,
    }[activeMapProfile.featureComponent];

  return (
    <TypedMapLibreMap
      ref={mapRef}
      mapStyle={activeMapProfile.mapStyles[0].style}
      initialViewState={viewState}
      minZoom={MapConfig.MIN_ZOOM}
      maxZoom={MapConfig.MAX_ZOOM}
      maxBounds={MapConfig.BOUNDS}
      onMoveEnd={handleMoveEnd}
      onLoad={(e) => setBbox(e.target.getBounds())}
      attributionControl={false}
    >
      {FeatureComponent && (
        <FeatureComponent
          bbox={bbox}
          onSelectFeature={setSelectedFeature}
          mobileActiveMode={mobileActiveMode}
          setMobileActiveMode={setMobileActiveMode}
        />
      )}
        {activeMapProfile.id === "places" && (
        <>
            <SearchFeature
                mapCenter={{ lat: viewState.latitude, lng: viewState.longitude }}
                onSelectFeature={setSelectedFeature}
                mobileActiveMode={mobileActiveMode}
                setMobileActiveMode={setMobileActiveMode}
            />
            {selectedFeature && <SelectedPlaceMarker feature={selectedFeature} />}
            <PlacesFeature
                bbox={bbox}
                onSelectFeature={setSelectedFeature}
                mobileActiveMode={mobileActiveMode}
                setMobileActiveMode={setMobileActiveMode}
                poiId={selectedPoiId}
            />
        </>
    )}
      <PoiInteraction
        onSelectFeature={setSelectedFeature}
        poiId={selectedPoiId}
      />
      <MapStyleSwitcher
        activeMapProfile={activeMapProfile}
        onChangeMapProfile={handleOnChangeMapProfile}
      />
      <PoiDetails
        open={!!selectedFeature}
        onOpenChange={handleOnPoiDetailsClose}
        feature={selectedFeature}
      />
      <AttributionControl position="bottom-left" />
      <ScaleControl position="bottom-left" maxWidth={200} />
    </TypedMapLibreMap>
  );
}
