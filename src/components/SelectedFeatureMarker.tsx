"use client";

import type { Point } from "geojson";
import { MapPin } from "lucide-react";
import { Marker } from "react-map-gl/maplibre";
import { PlaceMarkerIcon } from "@/components/PlaceMarkerIcon";
import { DEFAULT_ICON, PLACE_ICONS } from "@/config/places-icons";
import { useMapConfig, useMapSelection } from "@/providers/MapProvider";

/**
 * Marker over the selected point feature: a bouncing pin (always) that clearly
 * marks the exact spot among nearby objects, plus the feature's category icon
 * beneath it when it has one (`properties.TYPE`) — drawn here, independent of
 * the map filters, so a searched place keeps its icon even when its layer is
 * filtered out. Non-point features are outlined instead (see useFeatureHighlight).
 *
 * The category icon is only shown for the "places" profile, whose own map
 * layer (PlacesFeature) already draws these same PLACE_ICONS, so the
 * selection marker matches what was on the map. Other profiles that reuse
 * `TYPE` (e.g. craftbeer, always "PUB") render their unselected points with
 * the base style's own POI icons, which don't match PLACE_ICONS — showing a
 * different icon on selection there would look like a broken swap rather
 * than a highlight.
 */
export function SelectedFeatureMarker() {
  const { selectedFeature: feature } = useMapSelection();
  const { activeMapProfile } = useMapConfig();
  if (feature?.geometry?.type !== "Point") return null;

  const [lng, lat] = (feature.geometry as Point).coordinates;
  const type = feature.properties?.TYPE;
  const showCategoryIcon = activeMapProfile.mapType === "places";
  const iconConfig =
    type && showCategoryIcon ? (PLACE_ICONS[type] ?? DEFAULT_ICON) : null;

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
