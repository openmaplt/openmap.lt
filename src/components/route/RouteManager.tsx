"use client";

import { MobileNavigationView } from "./MobileNavigationView";
import { RouteDetails } from "./RouteDetails";
import { RouteLayer } from "./RouteLayer";

export function RouteManager() {
  return (
    <>
      <RouteLayer />
      <RouteDetails />
      <MobileNavigationView />
    </>
  );
}
