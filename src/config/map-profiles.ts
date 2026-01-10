export type MapStyle = {
  name: string;
  style: string;
  image: string;
};

export type MapProfile = {
  id: string;
  mapType: string;
  mapStyles: MapStyle[];
  featureComponent?: "places" | "craftbeer";
};

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
    featureComponent: "craftbeer",
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
  },
  {
    id: "saugomos",
    mapType: "s",
    mapStyles: [
      {
        name: "Saugomos",
        style: "/styles/saugomos.json",
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
