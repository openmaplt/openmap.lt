"use client";

import { useRoute } from "@/hooks/use-route";
import { useMapConfig, useMapSelection } from "@/providers/MapProvider";
import { RouteDetails } from "./RouteDetails";
import { RouteLayer } from "./RouteLayer";

export function RouteManager() {
  const { routeStart, routeEnd } = useMapSelection();
  const { activeMapProfile, selectedVehicle } = useMapConfig();
  const vehicle =
    selectedVehicle || activeMapProfile.routingProfiles?.[0] || "car";
  const routingUrl = activeMapProfile.routingUrl || "https://openmap.lt/route";
  const routeResult = useRoute(
    routeStart,
    routeEnd,
    vehicle as any,
    routingUrl,
  );

  return (
    <>
      <RouteLayer {...routeResult} />
      <RouteDetails {...routeResult} />
    </>
  );
}
