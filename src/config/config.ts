import type { LngLatBoundsLike } from "maplibre-gl";

type Config = {
  DEFAULT_MAP_TYPE: string;
  DEFAULT_STYLE_MAP: string;
  DEFAULT_LATITUDE: number;
  DEFAULT_LONGITUDE: number;
  DEFAULT_ZOOM: number;
  MIN_ZOOM: number;
  MAX_ZOOM: number;
  BOUNDS: LngLatBoundsLike;
};

export const MapConfig: Config = {
  DEFAULT_MAP_TYPE: "m",
  DEFAULT_STYLE_MAP: "/styles/map.json",
  DEFAULT_LATITUDE: 55.19114,
  DEFAULT_LONGITUDE: 23.871,
  DEFAULT_ZOOM: 7,
  MIN_ZOOM: 7,
  MAX_ZOOM: 18,
  BOUNDS: [20.7, 53.7, 27.05, 56.65],
};
