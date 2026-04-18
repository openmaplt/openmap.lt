"use client";

import { useRoute } from "@/hooks/use-route";
import { useMapConfig, useMapSelection } from "@/providers/MapProvider";
import { RouteDetails } from "./RouteDetails";
import { RouteLayer } from "./RouteLayer";

export function RouteManager() {
  const { routeStart, routeEnd } = useMapSelection();
  const { activeMapProfile, selectedRouteProfile } = useMapConfig();
  const vehicle =
    selectedRouteProfile || activeMapProfile.routingProfiles?.[0] || "car";
  const routeResult = useRoute(
    routeStart,
    routeEnd,
    vehicle as any,
    activeMapProfile.routingUrl,
  );

  return (
    <>
      <RouteLayer {...routeResult} />
      <RouteDetails {...routeResult} />
    </>
  );
}
