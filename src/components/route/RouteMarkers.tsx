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
    waypoints,
    navigationMode,
    highlightedRoutePoint,
    setRouteStart,
    setRouteEnd,
  } = useRoute();
  const { position } = useNavigationProgress();

  // Only number markers for a multi-stop (AI-generated) route — a plain
  // manual 2-point route keeps its original unnumbered green/red dots.
  // Numbers here must match the chat reply's numbered list exactly (see
  // buildRouteReplySystemPrompt, src/lib/aiSearchClient.ts): stops[0] (this
  // start marker) is "1", stops[last] (the end marker) is stops.length —
  // waypoints is stops.slice(1, -1), so waypoints[i] is stop i+2, not i+1.
  const hasNumberedStops = waypoints.length > 0;
  const endNumber = waypoints.length + 2;

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
            {hasNumberedStops ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 border-2 border-white shadow-md text-[11px] font-bold text-white cursor-move">
                1
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-white border-4 border-green-600 shadow-md cursor-move" />
            )}
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
          {hasNumberedStops ? (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 border-2 border-white shadow-md text-[11px] font-bold text-white cursor-move">
              {endNumber}
            </div>
          ) : (
            <div className="w-4 h-4 rounded-full bg-white border-4 border-red-600 shadow-md cursor-move" />
          )}
        </Marker>
      )}

      {waypoints.map((wp, i) => {
        const coords = (wp.geometry as Point).coordinates;
        return (
          <Marker
            key={`${coords[0]}-${coords[1]}`}
            longitude={coords[0]}
            latitude={coords[1]}
            anchor="center"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 border-2 border-white shadow-md text-[11px] font-bold text-white">
              {i + 2}
            </div>
          </Marker>
        );
      })}

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
