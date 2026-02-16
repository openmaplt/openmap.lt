import { PROTECTED_ACTIVE_LAYERS } from "./protected-filters";

export type MapStyle = {
  name: string;
  style: string;
  image: string;
};

export type MapProfile = {
  id: string;
  mapType: string;
  mapStyles: MapStyle[];
  featureComponent?: "places" | "craftbeer" | "protected";
  interactiveLayers?: string[];
};

const GENERAL_ACTIVE_LAYERS = ["label-amenity"];

export const MAP_PROFILES: MapProfile[] = [
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
    interactiveLayers: GENERAL_ACTIVE_LAYERS,
  },
  {
    id: "speed",
    mapType: "e",
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
    interactiveLayers: GENERAL_ACTIVE_LAYERS,
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
    interactiveLayers: GENERAL_ACTIVE_LAYERS,
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
    interactiveLayers: GENERAL_ACTIVE_LAYERS,
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
    interactiveLayers: GENERAL_ACTIVE_LAYERS,
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
    featureComponent: "craftbeer",
    interactiveLayers: GENERAL_ACTIVE_LAYERS,
  },
  {
    id: "places",
    mapType: "p",
    mapStyles: [
      {
        name: "Lankytinos",
        style: "/styles/places.json",
        image: "/maps/map.png",
      },
      {
        name: "Orto",
        style: "/styles/hybrid.json",
        image: "/maps/map_orto.png",
      },
    ],
    featureComponent: "places",
    interactiveLayers: ["places-layer"],
  },
  {
    id: "protected",
    mapType: "s",
    mapStyles: [
      {
        name: "Saugomos",
        style: "/styles/saugomos.json",
        image: "/maps/map_protected.png",
      },
      {
        name: "Orto",
        style: "/styles/saugomos_hybrid.json",
        image: "/maps/map_protected_hybrid.png",
      },
    ],
    featureComponent: "protected",
    interactiveLayers: PROTECTED_ACTIVE_LAYERS,
  },
];
