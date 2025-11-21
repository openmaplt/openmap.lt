import { useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useMap } from "react-map-gl/maplibre";
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

      const Icon = icon;
      const svgString = renderToStaticMarkup(
        <svg
          role="img"
          aria-label="Map marker"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="16" cy="17" r="14" fill="black" fillOpacity="0.2" />
          <circle
            cx="16"
            cy="16"
            r="14"
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
          <g transform="translate(8, 8)">
            <Icon size={16} color="white" strokeWidth={2} />
          </g>
        </svg>,
      );

      const image = new Image(32, 32);
      image.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
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
