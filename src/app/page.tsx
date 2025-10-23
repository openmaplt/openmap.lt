"use client";

import {
  GeolocateControl,
  Map as MapLibreMap,
  NavigationControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { Config } from "@/config";
import {
  formatHash,
  getInitialMapState,
  saveStateToStorage,
} from "@/libs/urlHash";

export default function Page() {
  const mapRef = useRef<MapRef>(null);
  const [viewState, _setViewState] = useState(() => {
    // This runs only once on client side
    const savedState = getInitialMapState();
    return {
      latitude: savedState?.latitude ?? Config.DEFAULT_LATITUDE,
      longitude: savedState?.longitude ?? Config.DEFAULT_LONGITUDE,
      zoom: savedState?.zoom ?? Config.DEFAULT_ZOOM,
      bearing: savedState?.bearing ?? 0,
      pitch: savedState?.pitch ?? 0,
    };
  });

  // Set initial hash if none exists
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash) {
      const state = getInitialMapState();
      if (state) {
        // User has localStorage but no hash
        const hash = formatHash(state);
        window.history.replaceState(null, "", hash);
      } else {
        // No hash and no localStorage, set default hash
        const hash = formatHash({
          mapType: "m",
          zoom: Config.DEFAULT_ZOOM,
          latitude: Config.DEFAULT_LATITUDE,
          longitude: Config.DEFAULT_LONGITUDE,
          bearing: 0,
          pitch: 0,
        });
        window.history.replaceState(null, "", hash);
      }
    }
  }, []);

  // Update URL hash and localStorage when map moves
  const handleMoveEnd = useCallback((evt: ViewStateChangeEvent) => {
    const { latitude, longitude, zoom, bearing, pitch } = evt.viewState;

    const state = {
      mapType: "m",
      zoom,
      latitude,
      longitude,
      bearing,
      pitch,
    };

    const hash = formatHash(state);

    // Update URL without triggering page reload
    window.history.replaceState(null, "", hash);

    // Save to localStorage as JSON
    saveStateToStorage(state);
  }, []);

  return (
    <div className="w-full h-screen">
      <MapLibreMap
        ref={mapRef}
        mapStyle={Config.DEFAULT_STYLE_MAP}
        initialViewState={viewState}
        minZoom={Config.MIN_ZOOM}
        maxZoom={Config.MAX_ZOOM}
        maxBounds={Config.BOUNDS}
        onMoveEnd={handleMoveEnd}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
      </MapLibreMap>
    </div>
  );
}
