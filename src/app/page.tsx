"use client";

"use client";

import {
  GeolocateControl,
  Map as MapLibreMap,
  NavigationControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { PoiInteraction } from "@/components/PoiInteraction";
import {
  MapStyle,
  MapProfile,
  MapStyleType,
} from "@/components/MapStyle";
import { Config } from "@/config";
import { useHashChange } from "@/hooks/use-hash-change";
import {
  formatHash,
  getMapState,
  parseHash,
  saveStateToStorage,
} from "@/lib/urlHash";

export default function Page() {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState(() => {
    // This runs only once on client side
    const { latitude, longitude, zoom, bearing, pitch } = getMapState();
    return { latitude, longitude, zoom, bearing, pitch };
  });

  const [activeMapProfile, setActiveMapProfile] = useState<MapProfile>(() => {
    const { mapId } = getMapState();
    return (
      Config.MAP_PROFILES.find((profile) => profile.name === mapId) ??
      Config.MAP_PROFILES[0]
    );
  });

  const [activeMapStyle, setActiveMapStyle] = useState<MapStyleType>(() => {
    const { styleId } = getMapState();
    const isOrtho = styleId === activeMapProfile.orthoStyle.name;
    return isOrtho ? activeMapProfile.orthoStyle : activeMapProfile.mapStyle;
  });

  const handleChangeMapProfile = useCallback((profile: MapProfile) => {
    setActiveMapProfile(profile);
    setActiveMapStyle(profile.mapStyle);
  }, []);

  const handleChangeMapStyle = useCallback((style: MapStyleType) => {
    setActiveMapStyle(style);
  }, []);

  useEffect(() => {
    const currentState = getMapState();
    const hashData = {
      ...currentState,
      ...viewState,
      mapId: activeMapProfile.name,
      styleId: activeMapStyle.name,
    };

    // Update URL without triggering page reload
    window.history.replaceState(null, "", formatHash(hashData));

    // Save to localStorage as JSON
    saveStateToStorage(hashData);
  }, [viewState, activeMapProfile, activeMapStyle]);

  // Listen for URL hash changes (when user manually edits URL)
  useHashChange(
    useCallback(() => {
      const newState = parseHash(window.location.hash);
      if (newState && mapRef.current) {
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

  return (
    <div className="w-full h-screen">
      <MapLibreMap
        ref={mapRef}
        mapStyle={activeMapStyle.style}
        initialViewState={viewState}
        minZoom={Config.MIN_ZOOM}
        maxZoom={Config.MAX_ZOOM}
        maxBounds={Config.BOUNDS}
        onMoveEnd={handleMoveEnd}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <PoiInteraction map={mapRef.current?.getMap()} />
        <MapStyle
          mapProfiles={Config.MAP_PROFILES}
          activeMapProfile={activeMapProfile}
          activeMapStyle={activeMapStyle}
          onChangeMapProfile={handleChangeMapProfile}
          onChangeMapStyle={handleChangeMapStyle}
        />
      </MapLibreMap>
    </div>
  );
}
