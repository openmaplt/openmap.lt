"use client";

import { Layer, Source } from "react-map-gl/maplibre";
import { useNavigationCamera } from "@/hooks/use-navigation-camera";
import {
  useNavigationProgress,
  useRoute,
  useRouteResult,
} from "@/providers/RouteProvider";
import { RouteMarkers } from "./RouteMarkers";
import { RouteStatusToast } from "./RouteStatusToast";

export function RouteLayer() {
  const { navigationMode } = useRoute();
  const { routeLine } = useRouteResult();
  const { remainingLine } = useNavigationProgress();
  useNavigationCamera();

  const displayedLine = navigationMode
    ? (remainingLine ?? routeLine)
    : routeLine;

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

      <RouteMarkers />
      <RouteStatusToast />
    </>
  );
}
