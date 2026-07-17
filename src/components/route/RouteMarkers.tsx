"use client";

import { point } from "@turf/helpers";
import type { Point } from "geojson";
import { Navigation2 } from "lucide-react";
import { Marker, type MarkerDragEvent } from "react-map-gl/maplibre";
import { useNavigationProgress, useRoute } from "@/providers/RouteProvider";

export function RouteMarkers() {
  const {
    routeStart,
    routeEnd,
    navigationMode,
    highlightedRoutePoint,
    setRouteStart,
    setRouteEnd,
  } = useRoute();
  const { position } = useNavigationProgress();

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
      {navigationMode && position ? (
        <Marker
          longitude={position[0]}
          latitude={position[1]}
          anchor="center"
          rotationAlignment="viewport"
        >
          <div className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40" />
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 border-2 border-white shadow-lg">
              <Navigation2 className="h-4 w-4 text-white" fill="white" />
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
    </>
  );
}
