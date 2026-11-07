"use client";

import type { Feature } from "geojson";
import type { LngLatBoundsLike } from "maplibre-gl";
import type { MapProfile } from "@/config/map-profiles";
import { MapProvider } from "@/providers/MapProvider";
import { RouteProvider } from "@/providers/RouteProvider";
import { MapContent } from "./MapContent";

interface MapPageProps {
  initialPoiData:
    | (Feature & {
        extent: LngLatBoundsLike;
        filter: string;
      })
    | null;
  // User-created profiles visible to this visitor (see viewerProfiles.ts).
  extraProfiles: MapProfile[];
}

export default function MapPage({
  initialPoiData,
  extraProfiles,
}: MapPageProps) {
  return (
    <MapProvider initialPoiData={initialPoiData} extraProfiles={extraProfiles}>
      <RouteProvider>
        <MapContent initialFilterType={initialPoiData?.filter} />
      </RouteProvider>
    </MapProvider>
  );
}
