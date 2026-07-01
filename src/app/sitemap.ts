import type { MetadataRoute } from "next";
import { BASE_URL } from "@/config/config";
import { getProfileClasses } from "@/data/omProfileClasses";
import { getProfiles } from "@/data/omProfiles";

export const dynamic = "force-dynamic";

const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    priority: 1.0,
    changeFrequency: "weekly",
  },
  {
    url: `${BASE_URL}/katalogas`,
    priority: 0.9,
    changeFrequency: "weekly",
  },
  {
    url: `${BASE_URL}/bendra-informacija`,
    priority: 0.8,
    changeFrequency: "monthly",
  },
  {
    url: `${BASE_URL}/zemelapio-duomenys`,
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    url: `${BASE_URL}/technine-informacija`,
    priority: 0.7,
    changeFrequency: "monthly",
  },
  {
    url: `${BASE_URL}/kontaktai`,
    priority: 0.6,
    changeFrequency: "yearly",
  },
  {
    url: `${BASE_URL}/prisidekite`,
    priority: 0.6,
    changeFrequency: "yearly",
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profiles = await getProfiles();

  const classEntries = await Promise.all(
    profiles.map((profile) => getProfileClasses(profile.name)),
  );

  const profileEntries: MetadataRoute.Sitemap = profiles.map((profile) => ({
    url: `${BASE_URL}/katalogas/${profile.name}`,
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));

  const classEntryList: MetadataRoute.Sitemap = profiles.flatMap((profile, i) =>
    classEntries[i].map((cls) => ({
      url: `${BASE_URL}/katalogas/${profile.name}/${cls.name}`,
      priority: 0.7,
      changeFrequency: "weekly" as const,
    })),
  );

  return [...STATIC_PAGES, ...profileEntries, ...classEntryList];
}
