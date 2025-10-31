import type { LngLatBoundsLike } from "maplibre-gl";

export type MapStyle = {
  name: string;
  style: string;
  image: string;
};

export type MapProfile = {
  id: string;
  mapType: string;
  mapStyles: MapStyle[];
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
};

export const MAPS: MapProfile[] = [
  {
    id: "general",
    mapType: "m",
    mapStyles: [
      {
        name: "Bendras",
        style: "/styles/map.json",
        image: "/maps/map_general.png",
      },
      {
        name: "Orto",
        style: "/styles/hybrid.json",
        image: "/maps/map_orto.png",
      },
    ],
  },
  {
    id: "speed",
    mapType: "s",
    mapStyles: [
      {
        name: "Greičiai",
        style: "/styles/speed.json",
        image: "/maps/map_speed.png",
      },
      {
        name: "Orto",
        style: "/styles/speed_hybrid.json",
        image: "/maps/map_orto.png",
      },
    ],
  },
  {
    id: "bicycle",
    mapType: "b",
    mapStyles: [
      {
        name: "Dviračiai",
        style: "/styles/bicycle.json",
        image: "/maps/map_bicycle.png",
      },
      {
        name: "Orto",
        style: "/styles/bicycle_hybrid.json",
        image: "/maps/map_orto.png",
      },
    ],
  },
  {
    id: "river",
    mapType: "r",
    mapStyles: [
      {
        name: "Upės",
        style: "/styles/upes.json",
        image: "/maps/map_upes.png",
      },
      {
        name: "Orto",
        style: "/styles/hybrid_upes.json",
        image: "/maps/map_orto.png",
      },
    ],
  },
  {
    id: "topo",
    mapType: "t",
    mapStyles: [
      {
        name: "Topografinis",
        style: "/styles/topo.json",
        image: "/maps/map_topo.png",
      },
      {
        name: "Orto",
        style: "/styles/hybrid.json",
        image: "/maps/map_orto.png",
      },
    ],
  },
  {
    id: "craftbeer",
    mapType: "c",
    mapStyles: [
      {
        name: "Alus",
        style: "/styles/beer_dark.json",
        image: "/maps/map_craftbeer.png",
      },
    ],
  },
  {
    id: "places",
    mapType: "p",
    mapStyles: [
      {
        name: "Lankytinos",
        style: "/styles/map.json",
        image: "/maps/map.png",
      },
      {
        name: "Orto",
        style: "/styles/hybrid.json",
        image: "/maps/map_orto.png",
      },
    ],
  },
];

export const Config: Config = {
  DEFAULT_MAP_TYPE: "m",
  DEFAULT_STYLE_MAP: "/styles/map.json",
  DEFAULT_LATITUDE: 55.19114,
  DEFAULT_LONGITUDE: 23.871,
  DEFAULT_ZOOM: 7,
  MIN_ZOOM: 7,
  MAX_ZOOM: 18,
  BOUNDS: [20.7, 53.7, 27.05, 56.65],
};
