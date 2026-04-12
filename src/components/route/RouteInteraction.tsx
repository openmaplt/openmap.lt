"use client";

import type { Feature, Point } from "geojson";
import { useEffect, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useMapActions, useMapConfig } from "@/providers/MapProvider";

export function RouteInteraction() {
  const { current: map } = useMap();
  const { routingMode } = useMapConfig();
  const { setRouteStart, setRouteEnd, setRoutingMode, setMobileActiveMode } =
    useMapActions();

  const [menuData, setMenuData] = useState<{
    x: number;
    y: number;
    lng: number;
    lat: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (!map) return;

    const handleContextMenu = (e: any) => {
      e.originalEvent.preventDefault();

      const features = map.queryRenderedFeatures(e.point);
      let name = "Pažymėtas taškas";
      if (features.length > 0 && features[0].properties?.name) {
        name = features[0].properties.name;
      }

      setMenuData({
        x: e.point.x,
        y: e.point.y,
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
        name,
      });
    };

    const closeMenu = () => setMenuData(null);

    map.on("contextmenu", handleContextMenu);
    map.on("click", closeMenu);
    map.on("drag", closeMenu);
    map.on("zoom", closeMenu);

    return () => {
      map.off("contextmenu", handleContextMenu);
      map.off("click", closeMenu);
      map.off("drag", closeMenu);
      map.off("zoom", closeMenu);
    };
  }, [map]);

  const handleSetPoint = (type: "start" | "end") => {
    if (!menuData) return;

    const feature: Feature<Point> = {
      type: "Feature",
      geometry: { type: "Point", coordinates: [menuData.lng, menuData.lat] },
      properties: { name: menuData.name },
    };

    if (type === "start") setRouteStart(feature);
    else setRouteEnd(feature);

    if (!routingMode) {
      setRoutingMode(true);
      setMobileActiveMode("routing");
    }

    setMenuData(null);
  };

  if (!menuData) return null;

  return (
    <div
      className="absolute z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1 flex flex-col min-w-[160px]"
      style={{ left: menuData.x, top: menuData.y }}
    >
      <button
        type="button"
        className="px-4 py-2 text-sm text-left hover:bg-gray-100 text-gray-800"
        onClick={() => handleSetPoint("start")}
      >
        Maršrutas iš čia
      </button>
      <button
        type="button"
        className="px-4 py-2 text-sm text-left hover:bg-gray-100 text-gray-800"
        onClick={() => handleSetPoint("end")}
      >
        Maršrutas į čia
      </button>
    </div>
  );
}
