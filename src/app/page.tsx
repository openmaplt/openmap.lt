"use client";

import {
  GeolocateControl,
  Map as MapLibreMap,
  NavigationControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Config } from "@/config";

export default function Page() {
  return (
    <div className="w-full h-screen">
      <MapLibreMap
        mapStyle={Config.DEFAULT_STYLE_MAP}
        initialViewState={{
          latitude: Config.DEFAULT_LATITUDE,
          longitude: Config.DEFAULT_LONGITUDE,
          zoom: Config.DEFAULT_ZOOM,
        }}
        minZoom={Config.MIN_ZOOM}
        maxZoom={Config.MAX_ZOOM}
        maxBounds={Config.BOUNDS}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
      </MapLibreMap>
    </div>
  );
}
