"use client";

import type * as React from "react";
import {
  GeolocateControl,
  Map as MapLibreMap,
  type MapProps,
  NavigationControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { MapStyleSwitcher } from "@/components/MapStyleSwitcher";
import { PoiInteraction } from "@/components/PoiInteraction";
import { SearchBar } from "@/components/SearchBar";
import { Config, MAPS, type MapProfile } from "@/config";
import { useHashChange } from "@/hooks/use-hash-change";
import type { POIResult } from "@/lib/searchDb";
import {
  formatHash,
  getMapState,
  parseHash,
  saveStateToStorage,
} from "@/lib/urlHash";
import { findMapsByType } from "@/lib/utils";

export default function Page() {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState(() => {
    const { latitude, longitude, zoom, bearing, pitch } = getMapState();
    return { latitude, longitude, zoom, bearing, pitch };
  });

  const [activeMapProfile, setActiveMapProfile] = useState<MapProfile>(() => {
    const { mapType } = getMapState();
    return findMapsByType(mapType) ?? MAPS[0];
  });

  useEffect(() => {
    const currentState = getMapState();
    const hashData = {
      ...currentState,
      mapType: activeMapProfile.mapType,
      ...viewState,
    };

    // Update URL without triggering page reload
    window.history.replaceState(null, "", formatHash(hashData));

    // Save to localStorage as JSON
    saveStateToStorage(hashData);
  }, [viewState, activeMapProfile]);

  // Listen for URL hash changes (when user manually edits URL)
  useHashChange(
    useCallback(() => {
      const newState = parseHash(window.location.hash);
      if (newState && mapRef.current) {
        const profile = findMapsByType(newState.mapType);
        if (profile) {
          setActiveMapProfile(profile);
        }

        // Update map view to match the new URL
        mapRef.current.flyTo({
          center: [newState.longitude, newState.latitude],
          zoom: newState.zoom,
          bearing: newState.bearing,
          pitch: newState.pitch,
          duration: 1000,
        });
      }
    }, []),
  );

  // Update URL hash and localStorage when map moves
  const handleMoveEnd = useCallback(({ viewState }: ViewStateChangeEvent) => {
    const { latitude, longitude, zoom, bearing, pitch } = viewState;
    setViewState({ latitude, longitude, zoom, bearing, pitch });
  }, []);

  // Handle search result selection
  const handleSearchResultSelect = useCallback((result: POIResult) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [result.longitude, result.latitude],
        zoom: 16,
        duration: 2000,
      });
    }
  }, []);

  const TypedMapLibreMap = MapLibreMap as React.ForwardRefExoticComponent<
    MapProps & React.RefAttributes<MapRef>
  >;

  return (
    <div className="w-full h-screen relative">
      <TypedMapLibreMap
        ref={mapRef}
        mapStyle={activeMapProfile.mapStyles[0].style}
        initialViewState={viewState}
        minZoom={Config.MIN_ZOOM}
        maxZoom={Config.MAX_ZOOM}
        maxBounds={Config.BOUNDS}
        onMoveEnd={handleMoveEnd}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <PoiInteraction activeMapProfile={activeMapProfile} />
        <MapStyleSwitcher
          activeMapProfile={activeMapProfile}
          onChangeMapProfile={(profile) => setActiveMapProfile(profile)}
        />
      </TypedMapLibreMap>
      <SearchBar onResultSelect={handleSearchResultSelect} />
    </div>
  );
}
