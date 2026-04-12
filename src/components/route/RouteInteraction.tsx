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

    let touchTimeout: any;
    let touchStartDetail: { x: number; y: number } | null = null;

    const handleContextMenu = (e: any) => {
      if (e.originalEvent) e.originalEvent.preventDefault();

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

    const handleTouchStart = (e: any) => {
      if (e.originalEvent.touches.length > 1) {
        clearTimeout(touchTimeout);
        return;
      }
      touchStartDetail = { x: e.point.x, y: e.point.y };
      touchTimeout = setTimeout(() => {
        handleContextMenu(e);
      }, 600);
    };

    const handleTouchEnd = () => {
      clearTimeout(touchTimeout);
      touchStartDetail = null;
    };

    const handleTouchMove = (e: any) => {
      if (!touchStartDetail) return;
      const dist = Math.sqrt(
        (e.point.x - touchStartDetail.x) ** 2 +
          (e.point.y - touchStartDetail.y) ** 2,
      );
      if (dist > 10) {
        clearTimeout(touchTimeout);
      }
    };

    const closeMenu = () => setMenuData(null);

    map.on("contextmenu", handleContextMenu);
    map.on("touchstart", handleTouchStart);
    map.on("touchend", handleTouchEnd);
    map.on("touchmove", handleTouchMove);
    map.on("click", closeMenu);
    map.on("drag", closeMenu);
    map.on("zoom", closeMenu);

    return () => {
      clearTimeout(touchTimeout);
      map.off("contextmenu", handleContextMenu);
      map.off("touchstart", handleTouchStart);
      map.off("touchend", handleTouchEnd);
      map.off("touchmove", handleTouchMove);
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
      className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 flex flex-col min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
      style={{ left: menuData.x, top: menuData.y }}
    >
      <button
        type="button"
        className="px-5 py-3 text-[15px] font-medium text-left hover:bg-gray-50 text-gray-900 transition-colors first:rounded-t-xl"
        onClick={() => handleSetPoint("start")}
      >
        🚩 Maršrutas iš čia
      </button>
      <button
        type="button"
        className="px-5 py-3 text-[15px] font-medium text-left hover:bg-gray-50 text-gray-900 transition-colors last:rounded-b-xl"
        onClick={() => handleSetPoint("end")}
      >
        🏁 Maršrutas į čia
      </button>
    </div>
  );
}
