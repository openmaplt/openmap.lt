import type { LngLatBoundsLike } from "maplibre-gl";

export type MapStyle = {
  name: string;
  style: string;
  image: string;
};

export type MapProfile = {
  name: string;
  mapStyle: MapStyle;
  orthoStyle: MapStyle;
};

type Config = {
  DEFAULT_MAP_TYPE: string;
  DEFAULT_STYLE_MAP: string;
  DEFAULT_LATITUDE: number;
  DEFAULT_LONGITUDE: number;
  DEFAULT_ZOOM: number;
  MIN_ZOOM: number;
  MAX_ZOOM: number;
  BOUNDS: LngLatBoundsLike;
  MAP_PROFILES: MapProfile[];
};

export const Config: Config = {
  DEFAULT_MAP_TYPE: "m",
  DEFAULT_STYLE_MAP: "/styles/map.json",
  DEFAULT_LATITUDE: 55.19114,
  DEFAULT_LONGITUDE: 23.871,
  DEFAULT_ZOOM: 7,
  MIN_ZOOM: 7,
  MAX_ZOOM: 18,
  BOUNDS: [20.7, 53.7, 27.05, 56.65],
  MAP_PROFILES: [
    {
      name: "standard",
      mapStyle: {
        name: "standard",
        style: "/styles/map.json",
        image: "/images/standard.png",
      },
      orthoStyle: {
        name: "orto",
        style: "/styles/orto.json",
        image: "/images/orto.png",
      },
    },
    {
      name: "speed",
      mapStyle: {
        name: "speed",
        style: "/styles/speed.json",
        image: "/images/speed.png",
      },
      orthoStyle: {
        name: "speed_hybrid",
        style: "/styles/speed_hybrid.json",
        image: "/images/speed_hybrid.png",
      },
    },
    {
      name: "bicycle",
      mapStyle: {
        name: "bicycle",
        style: "/styles/bicycle.json",
        image: "/images/bicycle.png",
      },
      orthoStyle: {
        name: "bicycle_hybrid",
        style: "/styles/bicycle_hybrid.json",
        image: "/images/bicycle_hybrid.png",
      },
    },
  ],
};
