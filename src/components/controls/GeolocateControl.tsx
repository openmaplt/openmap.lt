"use client";

import { LocateFixed } from "lucide-react";
import { useEffect, useRef } from "react";
import { Marker } from "react-map-gl/maplibre";
import { useGeolocation } from "@/hooks/use-geolocation";
import { cn } from "@/lib/utils";
import { useMapActions } from "@/providers/MapProvider";

const btnStyle =
  "p-2 bg-white rounded-lg shadow-lg border border-gray-300 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center";

interface GeolocateControlProps {
  minZoom?: number;
}

export function GeolocateControl({ minZoom = 17 }: GeolocateControlProps) {
  const { mapRef } = useMapActions();
  const { isLocating, position, toggle } = useGeolocation();
  const hasFlownRef = useRef(false);

  useEffect(() => {
    if (!position) {
      hasFlownRef.current = false;
      return;
    }

    const map = mapRef.current?.getMap();
    if (!map) return;

    if (!hasFlownRef.current) {
      map.flyTo({
        center: position,
        zoom: Math.max(map.getZoom(), minZoom),
        duration: 1500,
      });
      hasFlownRef.current = true;
    } else if (!map.getBounds().contains(position)) {
      map.easeTo({ center: position, duration: 1000 });
    }
  }, [position, mapRef, minZoom]);

  return (
    <>
      {position && (
        <Marker longitude={position[0]} latitude={position[1]} anchor="center">
          <div className="relative flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-md z-10" />
            <div className="absolute w-4 h-4 rounded-full bg-blue-500 opacity-30 animate-ping" />
          </div>
        </Marker>
      )}

      <button
        className={cn(btnStyle, isLocating && "border-blue-500 bg-blue-50")}
        onClick={toggle}
        title={isLocating ? "Išjungti poziciją" : "Mano pozicija"}
        type="button"
      >
        <LocateFixed
          className={cn(
            "size-4",
            isLocating ? "text-blue-600" : "text-blue-500",
          )}
        />
      </button>
    </>
  );
}
