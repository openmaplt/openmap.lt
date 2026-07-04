"use client";

import { useRouteProgress } from "@/hooks/use-route-progress";
import { useRouting } from "@/hooks/use-routing";
import { useMapConfig } from "@/providers/MapProvider";
import { useRoute } from "@/providers/RouteProvider";
import { RouteDetails } from "./RouteDetails";
import { RouteLayer } from "./RouteLayer";

export function RouteManager() {
  const { routeStart, routeEnd, selectedRouteProfile, navigationMode } =
    useRoute();
  const { activeMapProfile } = useMapConfig();
  const vehicle =
    selectedRouteProfile || activeMapProfile.routingProfiles?.[0] || "car";
  const routeResult = useRouting(
    routeStart,
    routeEnd,
    vehicle,
    activeMapProfile.routingUrl,
  );
  const progress = useRouteProgress(
    routeResult.routeLine,
    routeResult.distance,
    routeResult.time,
    navigationMode,
  );

  return (
    <>
      <RouteLayer {...routeResult} progress={progress} />
      <RouteDetails {...routeResult} progress={progress} />
    </>
  );
}
