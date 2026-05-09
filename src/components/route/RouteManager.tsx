"use client";

import { useRouting } from "@/hooks/use-routing";
import { useMapConfig } from "@/providers/MapProvider";
import { useRoute } from "@/providers/RouteProvider";
import { RouteDetails } from "./RouteDetails";
import { RouteLayer } from "./RouteLayer";

export function RouteManager() {
  const { routeStart, routeEnd, selectedRouteProfile } = useRoute();
  const { activeMapProfile } = useMapConfig();
  const vehicle =
    selectedRouteProfile || activeMapProfile.routingProfiles?.[0] || "car";
  const routeResult = useRouting(
    routeStart,
    routeEnd,
    vehicle,
    activeMapProfile.routingUrl,
  );

  return (
    <>
      <RouteLayer {...routeResult} />
      <RouteDetails {...routeResult} />
    </>
  );
}
