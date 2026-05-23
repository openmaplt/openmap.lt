import type { MetadataRoute } from "next";

const BASE_URL = "https://openmap.lt";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}/bendra-informacija`, priority: 0.8 },
    { url: `${BASE_URL}/katalogas`, priority: 0.9 },
    { url: `${BASE_URL}/zemelapio-duomenys`, priority: 0.7 },
    { url: `${BASE_URL}/technine-informacija`, priority: 0.7 },
    { url: `${BASE_URL}/kontaktai`, priority: 0.6 },
    { url: `${BASE_URL}/prisidekite`, priority: 0.6 },
  ];
}
