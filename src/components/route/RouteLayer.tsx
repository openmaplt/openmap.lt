"use client";

import type { Feature, LineString } from "geojson";
import { LngLatBounds } from "maplibre-gl";
import { useEffect } from "react";
import { Layer, Marker, Source } from "react-map-gl/maplibre";
import { useMapActions, useMapSelection } from "@/providers/MapProvider";

interface RouteLayerProps {
  routeLine: Feature<LineString> | null;
  distance: number | null;
  time: number | null;
  loading: boolean;
  error: string | null;
}

export function RouteLayer({ routeLine, loading, error }: RouteLayerProps) {
  const { routeStart, routeEnd, highlightedRoutePoint } = useMapSelection();
  const { mapRef, setRouteStart, setRouteEnd } = useMapActions();

  useEffect(() => {
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
  }, [routeLine, mapRef]);

  if (error) {
    console.error("RouteLayer error:", error);
  }

  const handleStartDragEnd = (e: any) => {
    const { lng, lat } = e.lngLat;
    setRouteStart({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      properties: {
        name: "Pasirinktas taškas",
      },
    });
  };

  const handleEndDragEnd = (e: any) => {
    const { lng, lat } = e.lngLat;
    setRouteEnd({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [lng, lat],
      },
      properties: {
        name: "Pasirinktas taškas",
      },
    });
  };

  return (
    <>
      {routeLine && (
        <Source id="route-source" type="geojson" data={routeLine}>
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

      {routeStart && (
        <Marker
          longitude={(routeStart.geometry as any).coordinates[0]}
          latitude={(routeStart.geometry as any).coordinates[1]}
          anchor="center"
          draggable
          onDragEnd={handleStartDragEnd}
        >
          <div className="w-4 h-4 rounded-full bg-white border-4 border-green-600 shadow-md cursor-move" />
        </Marker>
      )}

      {routeEnd && (
        <Marker
          longitude={(routeEnd.geometry as any).coordinates[0]}
          latitude={(routeEnd.geometry as any).coordinates[1]}
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
