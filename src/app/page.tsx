"use client";

import {
  type LngLatBounds,
  Map as MapLibreMap,
  type MapProps,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MapRef, ViewStateChangeEvent } from "react-map-gl/maplibre";
import { MapStyleSwitcher } from "@/components/MapStyleSwitcher";
import { PlacesFeature } from "@/components/PlacesFeature";
import { PoiInteraction } from "@/components/PoiInteraction";
import { MAPS, MapConfig, type MapProfile } from "@/config/map";
import { useHashChange } from "@/hooks/use-hash-change";
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

  const [bbox, setBbox] = useState<LngLatBounds | null>(null);

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
  const handleMoveEnd = useCallback(
    ({ viewState, target }: ViewStateChangeEvent) => {
      const { latitude, longitude, zoom, bearing, pitch } = viewState;
      setViewState({ latitude, longitude, zoom, bearing, pitch });
      setBbox(target.getBounds());
    },
    [],
  );

  const TypedMapLibreMap = MapLibreMap as React.ForwardRefExoticComponent<
    MapProps & React.RefAttributes<MapRef>
  >;

  return (
    <div className="w-full h-screen">
      <TypedMapLibreMap
        ref={mapRef}
        mapStyle={activeMapProfile.mapStyles[0].style}
        initialViewState={viewState}
        minZoom={MapConfig.MIN_ZOOM}
        maxZoom={MapConfig.MAX_ZOOM}
        maxBounds={MapConfig.BOUNDS}
        onMoveEnd={handleMoveEnd}
        onLoad={(e) => setBbox(e.target.getBounds())}
      >
        <PoiInteraction activeMapProfile={activeMapProfile} />
        <MapStyleSwitcher
          activeMapProfile={activeMapProfile}
          onChangeMapProfile={(profile) => setActiveMapProfile(profile)}
        />
        {activeMapProfile.id === "places" && <PlacesFeature bbox={bbox} />}
      </TypedMapLibreMap>
    </div>
  );
}
