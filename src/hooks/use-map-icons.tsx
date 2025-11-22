import { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useMap } from "react-map-gl/maplibre";
import { PlaceMarkerIcon } from "@/components/PlaceMarkerIcon";
import { DEFAULT_ICON, PLACE_ICONS } from "@/config/places-icons";

export function useMapIcons() {
  const { current: mapRef } = useMap();

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;

    const createAndAddIcon = (
      id: string,
      icon: React.ElementType,
      color: string,
    ) => {
      if (map.hasImage(id)) return;

      const image = new Image(32, 32);
      image.src = `data:image/svg+xml;base64,${btoa(
        renderToStaticMarkup(<PlaceMarkerIcon icon={icon} color={color} />),
      )}`;
      image.onload = () => {
        if (!map.hasImage(id)) {
          map.addImage(id, image, { sdf: false });
        }
      };
    };

    const addIcons = () => {
      // Register all typed icons
      Object.entries(PLACE_ICONS).forEach(([type, config]) => {
        createAndAddIcon(`icon-${type}`, config.icon, config.color);
      });

      // Register default icon
      createAndAddIcon("icon-default", DEFAULT_ICON.icon, DEFAULT_ICON.color);
    };

    if (map.isStyleLoaded()) {
      addIcons();
    } else {
      map.once("styledata", addIcons);
    }

    return () => {
      map.off("styledata", addIcons);
    };
  }, [mapRef]);
}
