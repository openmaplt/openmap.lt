"use client";

import {
  GeolocateControl,
  Map as MapLibreMap,
  NavigationControl,
} from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Page() {
  return (
    <div className="w-full h-screen">
      <MapLibreMap
        mapStyle="https://openmap.lt/styles/map.json"
        initialViewState={{
          latitude: 55.19114,
          longitude: 23.871,
          zoom: 7,
        }}
        minZoom={7}
        maxZoom={18}
        maxBounds={[20.7, 53.7, 27.05, 56.65]}
      >
        <NavigationControl position="top-left" />
        <GeolocateControl position="top-left" />
      </MapLibreMap>
    </div>
  );
}
