"use client";

import { point } from "@turf/helpers";
import { useCallback, useEffect } from "react";
import { useRouteProgress } from "@/hooks/use-route-progress";
import { useRouting } from "@/hooks/use-routing";
import { useMapConfig } from "@/providers/MapProvider";
import { useRoute } from "@/providers/RouteProvider";
import { RouteDetails } from "./RouteDetails";
import { RouteLayer } from "./RouteLayer";

const ARRIVED_AUTO_STOP_MS = 4000;

export function RouteManager() {
  const {
    routeStart,
    routeEnd,
    selectedRouteProfile,
    navigationMode,
    setRouteStart,
    setNavigationMode,
  } = useRoute();
  const { activeMapProfile } = useMapConfig();
  const vehicle =
    selectedRouteProfile || activeMapProfile.routingProfiles?.[0] || "car";
  const routeResult = useRouting(
    routeStart,
    routeEnd,
    vehicle,
    activeMapProfile.routingUrl,
  );

  const handleOffRoute = useCallback(
    (position: [number, number]) => {
      setRouteStart(
        point(position, {
          name: "Mano dabartinė vietovė",
          isLiveLocation: true,
        }),
      );
    },
    [setRouteStart],
  );

  const progress = useRouteProgress(
    routeResult.routeLine,
    routeResult.distance,
    routeResult.time,
    navigationMode,
    handleOffRoute,
  );

  useEffect(() => {
    if (!progress.arrived) return;
    const timer = setTimeout(
      () => setNavigationMode(false),
      ARRIVED_AUTO_STOP_MS,
    );
    return () => clearTimeout(timer);
  }, [progress.arrived, setNavigationMode]);

  return (
    <>
      <RouteLayer {...routeResult} progress={progress} />
      <RouteDetails {...routeResult} progress={progress} />
    </>
  );
}
