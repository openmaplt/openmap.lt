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
import { Config } from "@/config";
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

  useEffect(() => {
    const currentState = getMapState();
    const hashData = {
      ...currentState,
      ...viewState,
    };

    // Update URL without triggering page reload
    window.history.replaceState(null, "", formatHash(hashData));

    // Save to localStorage as JSON
    saveStateToStorage(hashData);
  }, [viewState]);

  // Listen for URL hash changes (when user manually edits URL)
  useEffect(() => {
    const handleHashChange = () => {
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
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update URL hash and localStorage when map moves
  const handleMoveEnd = useCallback(({ viewState }: ViewStateChangeEvent) => {
    const { latitude, longitude, zoom, bearing, pitch } = viewState;
    setViewState({ latitude, longitude, zoom, bearing, pitch });
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
        <PoiInteraction />
      </MapLibreMap>
    </div>
  );
}
