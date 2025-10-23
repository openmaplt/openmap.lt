"use client";

import {
  GeolocateControl,
  Map as MapLibreMap,
  NavigationControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useState } from "react";
import type { ViewStateChangeEvent } from "react-map-gl/maplibre";
import { Config } from "@/config";
import { formatHash, getInitialMapState, saveHashToStorage } from "@/urlHash";

export default function Page() {
  const [initialViewState, setInitialViewState] = useState({
    latitude: Config.DEFAULT_LATITUDE,
    longitude: Config.DEFAULT_LONGITUDE,
    zoom: Config.DEFAULT_ZOOM,
    bearing: 0,
    pitch: 0,
  });

  // Load initial state from URL or localStorage
  useEffect(() => {
    const savedState = getInitialMapState();
    if (savedState) {
      setInitialViewState({
        latitude: savedState.latitude,
        longitude: savedState.longitude,
        zoom: savedState.zoom,
        bearing: savedState.bearing,
        pitch: savedState.pitch,
      });
    }
  }, []);

  // Update URL hash when map moves
  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    const { latitude, longitude, zoom, bearing, pitch } = evt.viewState;

    const hash = formatHash({
      mapType: "m",
      zoom,
      latitude,
      longitude,
      bearing,
      pitch,
    });

    // Update URL without triggering page reload
    window.history.replaceState(null, "", hash);

    // Save to localStorage
    saveHashToStorage(hash);
  }, []);

  return (
    <div className="w-full h-screen">
      <MapLibreMap
        mapStyle={Config.DEFAULT_STYLE_MAP}
        initialViewState={initialViewState}
        minZoom={Config.MIN_ZOOM}
        maxZoom={Config.MAX_ZOOM}
        maxBounds={Config.BOUNDS}
        onMove={handleMove}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
      </MapLibreMap>
    </div>
  );
}
