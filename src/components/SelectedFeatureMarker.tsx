"use client";

import type { Point } from "geojson";
import { MapPin } from "lucide-react";
import { Marker } from "react-map-gl/maplibre";
import { PlaceMarkerIcon } from "@/components/PlaceMarkerIcon";
import { DEFAULT_ICON, PLACE_ICONS } from "@/config/places-icons";
import { useMapSelection } from "@/providers/MapProvider";

/**
 * Marker over the selected point feature: a bouncing pin (always) that clearly
 * marks the exact spot among nearby objects, plus the feature's category icon
 * beneath it when it has one (`properties.TYPE`) — drawn here, independent of
 * the map filters, so a searched place keeps its icon even when its layer is
 * filtered out. Non-point features are outlined instead (see useFeatureHighlight).
 */
export function SelectedFeatureMarker() {
  const { selectedFeature: feature } = useMapSelection();
  if (!feature || feature.geometry?.type !== "Point") return null;

  const [lng, lat] = (feature.geometry as Point).coordinates;
  const type = feature.properties?.TYPE;
  const iconConfig = type ? (PLACE_ICONS[type] ?? DEFAULT_ICON) : null;

  return (
    <Marker longitude={lng} latitude={lat} anchor="center">
      <div className="relative flex items-center justify-center w-8 h-8">
        {iconConfig && (
          <div className="absolute inset-0">
            <PlaceMarkerIcon icon={iconConfig.icon} color={iconConfig.color} />
          </div>
        )}
        <div className="absolute bottom-full animate-bounce">
          <MapPin
            className="w-8 h-8 text-blue-600 fill-blue-600 drop-shadow-md"
            stroke="white"
            strokeWidth={1.5}
          />
        </div>
      </div>
    </Marker>
  );
}
