"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import "@/lib/maplibreWorker";
import {
  AttributionControl,
  Map as MapLibreMap,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/maplibre";
import { MapConfig } from "@/config/config";

interface ProfilePreviewMapProps {
  // URL of the profile's style (see src/app/api/profile-styles).
  styleUrl: string;
}

// The profile's map as a visitor would get it from /m/<slug>: same style, fully
// interactive (pan, zoom). Kept separate from ProfilePreview so it can be
// loaded lazily; maplibre-gl is large and most account pages never need it.
export default function ProfilePreviewMap({
  styleUrl,
}: ProfilePreviewMapProps) {
  return (
    <MapLibreMap
      mapStyle={styleUrl}
      initialViewState={{
        latitude: MapConfig.DEFAULT_LATITUDE,
        longitude: MapConfig.DEFAULT_LONGITUDE,
        zoom: MapConfig.DEFAULT_ZOOM,
      }}
      minZoom={MapConfig.MIN_ZOOM}
      maxZoom={MapConfig.MAX_ZOOM}
      maxBounds={MapConfig.BOUNDS}
      attributionControl={false}
      style={{ width: "100%", height: "100%" }}
    >
      <NavigationControl position="top-left" showCompass={false} />
      <ScaleControl position="bottom-left" maxWidth={120} />
      <AttributionControl position="bottom-right" compact />
    </MapLibreMap>
  );
}
