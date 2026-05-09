"use client";

import type { Feature } from "geojson";
import type { LngLatBoundsLike } from "maplibre-gl";
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
}

export default function MapPage({ initialPoiData }: MapPageProps) {
  return (
    <MapProvider initialPoiData={initialPoiData}>
      <RouteProvider>
        <MapContent initialFilterType={initialPoiData?.filter} />
      </RouteProvider>
    </MapProvider>
  );
}
