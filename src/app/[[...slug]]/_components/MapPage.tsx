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
import type { LngLatBoundsLike } from "maplibre-gl";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { CraftbeerFeature } from "@/components/CraftbeerFeature";
import { MapStyleSwitcher } from "@/components/MapStyleSwitcher";
import { PlacesProfileComponents } from "@/components/PlacesProfileComponents";
import { PoiDetails } from "@/components/PoiDetails";
import { PoiInteraction } from "@/components/PoiInteraction";
import { ProtectedProfileComponents } from "@/components/ProtectedProfileComponents";
import { MapConfig } from "@/config/config";
import { MAP_PROFILES, type MapProfile } from "@/config/map-profiles";
import { PROTECTED_FILTERS } from "@/config/protected-filters";
import {
  formatSearchParams,
  getMapState,
  saveStateToStorage,
} from "@/lib/urlHash";
import { findMapsByType, slugify } from "@/lib/utils";

interface MapPageProps {
  initialPoiData?: {
    extent: LngLatBoundsLike;
    filter: string;
    properties?: Record<string, string>;
  } | null;
}

export default function MapPage({ initialPoiData }: MapPageProps) {
  const pathname = usePathname();
  const [, mapType, poiSlug] = pathname.split("/");
  const poiId = poiSlug !== "map" ? poiSlug?.split("-")[0] : undefined;

  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState<MapProps["initialViewState"]>(
    () => {
      const state = getMapState();
      const initialState: MapProps["initialViewState"] = {
        latitude: state.latitude,
        longitude: state.longitude,
        zoom: state.zoom,
        bearing: state.bearing,
        pitch: state.pitch,
      };

      if (initialPoiData?.extent) {
        initialState.bounds = initialPoiData.extent;
        initialState.fitBoundsOptions = {
          padding: 50,
          maxZoom: MapConfig.MAX_ZOOM,
        };
      }

      return initialState;
    },
  );

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

    // Create a clean state object for storage/URL without bounds/fitBoundsOptions
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

    // Update URL without triggering page reload
    const poiName =
      selectedFeature?.properties?.name ?? initialPoiData?.properties?.name;
    const poiSlugWithName = [selectedPoiId, poiName ? slugify(poiName) : null]
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
      setSelectedPoiId(selectedFeature.properties?.id ?? selectedFeature.id);
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
      places: PlacesProfileComponents,
      craftbeer: CraftbeerFeature,
      protected: ProtectedProfileComponents,
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
          selectedFeature={selectedFeature}
          mapCenter={{
            lat: viewState?.latitude || MapConfig.DEFAULT_LATITUDE,
            lng: viewState?.longitude || MapConfig.DEFAULT_LONGITUDE,
          }}
          poiId={selectedPoiId}
          initialFilterType={initialPoiData?.filter}
        />
      )}
      <PoiInteraction
        onSelectFeature={setSelectedFeature}
        poiId={selectedPoiId}
        layers={activeMapProfile.interactiveLayers}
        getLayerLabel={(layerId) => {
          if (activeMapProfile.id === "protected") {
            return (
              PROTECTED_FILTERS.find((f) => f.layers.includes(layerId))
                ?.label || layerId
            );
          }

          return layerId;
        }}
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
