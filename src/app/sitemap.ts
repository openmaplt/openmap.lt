import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { BASE_URL } from "@/config/config";
import { getProfileClasses } from "@/data/omProfileClasses";
import { getProfileClassObjects } from "@/data/omProfileClassObjects";
import { getProfiles } from "@/data/omProfiles";

// Generate at runtime, never at build: CI builds with a placeholder DATABASE_URL,
// so a prerendered sitemap would be baked empty into the image. force-dynamic
// keeps it out of the build, and unstable_cache below caches the DB work for a
// day — so Google gets an instant response and we hit the DB at most once/day
// (the catalog changes rarely).
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

const buildSitemap = unstable_cache(
  async (): Promise<MetadataRoute.Sitemap> => {
    const profiles = await getProfiles();

    const classEntries = await Promise.all(
      profiles.map((profile) => getProfileClasses(profile.name)),
    );

    const profileEntries: MetadataRoute.Sitemap = profiles.map((profile) => ({
      url: `${BASE_URL}/katalogas/${profile.name}`,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    }));

    const classEntryList: MetadataRoute.Sitemap = profiles.flatMap(
      (profile, i) =>
        classEntries[i].map((cls) => ({
          url: `${BASE_URL}/katalogas/${profile.name}/${cls.name}`,
          priority: 0.7,
          changeFrequency: "weekly" as const,
        })),
    );

    // Individual POI detail pages (e.g. /places/255-aknysteliu-piliakalnis).
    // These were only discoverable via referring catalog pages before; listing
    // them directly speeds up and stabilises indexing (~4k URLs, well under the
    // 50k sitemap limit).
    const objectLists = await Promise.all(
      profiles.flatMap((profile, i) =>
        classEntries[i].map((cls) =>
          getProfileClassObjects(profile.name, cls.name),
        ),
      ),
    );

    const objectEntryList: MetadataRoute.Sitemap = objectLists
      .flat()
      .map((obj) => ({
        url: `${BASE_URL}${obj.url}`,
        priority: 0.6,
        changeFrequency: "monthly" as const,
      }));

    return [
      ...STATIC_PAGES,
      ...profileEntries,
      ...classEntryList,
      ...objectEntryList,
    ];
  },
  ["sitemap"],
  { revalidate: 86400 },
);

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap();
}
