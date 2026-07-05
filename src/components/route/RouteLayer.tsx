"use client";

import { point } from "@turf/helpers";
import type { Point } from "geojson";
import { Navigation } from "lucide-react";
import { LngLatBounds } from "maplibre-gl";
import { useEffect, useRef } from "react";
import {
  Layer,
  Marker,
  type MarkerDragEvent,
  Source,
} from "react-map-gl/maplibre";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMapActions } from "@/providers/MapProvider";
import {
  useNavigationProgress,
  useRoute,
  useRouteResult,
} from "@/providers/RouteProvider";

export function RouteLayer() {
  const {
    routeStart,
    routeEnd,
    navigationMode,
    highlightedRoutePoint,
    setRouteStart,
    setRouteEnd,
  } = useRoute();
  const { routeLine, loading, error } = useRouteResult();
  const progress = useNavigationProgress();
  const { mapRef } = useMapActions();
  const isMobile = useIsMobile();
  const displayedLine = navigationMode
    ? (progress.remainingLine ?? routeLine)
    : routeLine;
  const navigationStartedRef = useRef(false);

  useEffect(() => {
    if (!navigationMode || !progress.position) {
      navigationStartedRef.current = false;
      return;
    }
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Defer to the next frame and let the cleanup below cancel it if this
    // effect fires twice back-to-back (React StrictMode double-invokes
    // effects in dev), otherwise two competing easeTo calls fight over zoom.
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      if (cancelled) return;
      const justStarted = !navigationStartedRef.current;
      navigationStartedRef.current = true;

      map.easeTo({
        center: progress.position as [number, number],
        bearing: progress.bearing ?? map.getBearing(),
        ...(justStarted ? { zoom: 17 } : {}),
        padding: isMobile ? { bottom: 300 } : { left: 400 },
        duration: justStarted ? 1500 : 1000,
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [navigationMode, progress.position, progress.bearing, mapRef, isMobile]);

  useEffect(() => {
    if (navigationMode) return;
    const map = mapRef.current?.getMap();
    if (!map || map.getBearing() === 0) return;
    map.easeTo({ bearing: 0, duration: 800 });
  }, [navigationMode, mapRef]);

  useEffect(() => {
    if (navigationMode) return;
    if (routeLine && routeLine.geometry.type === "LineString") {
      const coords = routeLine.geometry.coordinates;
      if (coords.length > 0) {
        const bounds = new LngLatBounds(
          coords[0] as [number, number],
          coords[0] as [number, number],
        );
        for (const coord of coords) {
          bounds.extend(coord as [number, number]);
        }

        // Ensure map is fitting the bounds smoothly after a short delay so the line has time to render
        requestAnimationFrame(() => {
          mapRef.current?.fitBounds(bounds, {
            padding: 80,
            duration: 800,
          });
        });
      }
    }
  }, [routeLine, mapRef, navigationMode]);

  if (error) {
    console.error("RouteLayer error:", error);
  }

  const handleStartDragEnd = (e: MarkerDragEvent) => {
    const { lng, lat } = e.lngLat;
    setRouteStart(point([lng, lat], { name: "Pasirinktas taškas" }));
  };

  const handleEndDragEnd = (e: MarkerDragEvent) => {
    const { lng, lat } = e.lngLat;
    setRouteEnd(point([lng, lat], { name: "Pasirinktas taškas" }));
  };

  return (
    <>
      {displayedLine && (
        <Source id="route-source" type="geojson" data={displayedLine}>
          <Layer
            id="route-line"
            type="line"
            layout={{
              "line-join": "round",
              "line-cap": "round",
            }}
            paint={{
              "line-color": "#3b82f6", // tailwind blue-500
              "line-width": 5,
              "line-opacity": 0.8,
            }}
          />
        </Source>
      )}

      {navigationMode && progress.position ? (
        <Marker
          longitude={progress.position[0]}
          latitude={progress.position[1]}
          anchor="center"
          rotationAlignment="viewport"
        >
          <div className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 border-2 border-white shadow-lg">
              <Navigation className="h-4 w-4 text-white" fill="white" />
            </div>
          </div>
        </Marker>
      ) : (
        routeStart && (
          <Marker
            longitude={(routeStart.geometry as Point).coordinates[0]}
            latitude={(routeStart.geometry as Point).coordinates[1]}
            anchor="center"
            draggable
            onDragEnd={handleStartDragEnd}
          >
            <div className="w-4 h-4 rounded-full bg-white border-4 border-green-600 shadow-md cursor-move" />
          </Marker>
        )
      )}

      {routeEnd && (
        <Marker
          longitude={(routeEnd.geometry as Point).coordinates[0]}
          latitude={(routeEnd.geometry as Point).coordinates[1]}
          anchor="center"
          draggable
          onDragEnd={handleEndDragEnd}
        >
          <div className="w-4 h-4 rounded-full bg-white border-4 border-red-600 shadow-md cursor-move" />
        </Marker>
      )}

      {highlightedRoutePoint && (
        <Marker
          longitude={highlightedRoutePoint[0]}
          latitude={highlightedRoutePoint[1]}
          anchor="center"
        >
          <div className="relative flex h-8 w-8 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-lg" />
          </div>
        </Marker>
      )}

      {loading && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 z-10 font-sans text-sm font-medium text-gray-800 animate-pulse">
          Skaičiuojamas maršrutas...
        </div>
      )}

      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-100/90 text-red-700 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-red-200 z-10 font-sans text-sm font-medium">
          {error}
        </div>
      )}
    </>
  );
}
