"use client";

import type { Feature, Point } from "geojson";
import { Marker } from "react-map-gl/maplibre";
import { PlaceMarkerIcon } from "@/components/PlaceMarkerIcon";
import { DEFAULT_ICON, PLACE_ICONS } from "@/config/places-icons";

interface SelectedPlaceMarkerProps {
  feature: Feature | null;
}

export function SelectedPlaceMarker({ feature }: SelectedPlaceMarkerProps) {
  if (!feature || feature.geometry.type !== "Point") {
    return null;
  }

  const [lng, lat] = (feature.geometry as Point).coordinates;
  const iconConfig = PLACE_ICONS[feature?.properties?.TYPE] || DEFAULT_ICON;

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="center"
      className="relative flex items-center justify-center w-8 h-8"
    >
      <div className="absolute inset-0">
        <PlaceMarkerIcon icon={iconConfig.icon} color={iconConfig.color} />
      </div>
    </Marker>
  );
}
