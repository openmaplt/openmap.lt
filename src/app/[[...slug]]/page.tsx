import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { HelpButton } from "@/components/HelpButton";
import { BASE_URL } from "@/config/config";
import { getPoiInfo } from "@/data/poiInfo";
import { buildPoiDescription, parsePoiSlug } from "@/lib/poiHelpers";
import { slugify } from "@/lib/utils";
import MapPage from "./_components/MapPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { mapType, poiSlug, poiId, nameFromSlug } = parsePoiSlug(slug);

  const canonical = poiSlug
    ? `${BASE_URL}/${mapType}/${poiSlug}`
    : mapType
      ? `${BASE_URL}/${mapType}`
      : BASE_URL;

  if (!poiId || !/^\d+$/.test(poiId)) {
    return { alternates: { canonical } };
  }

  const poiData = await getPoiInfo(poiId, mapType);
  const props = poiData?.properties as Record<
    string,
    string | undefined
  > | null;

  // DB-backed profiles (places, craftbeer, saugomos) return full properties;
  // vector-tile profiles (maps, bicycle, river, etc.) return {}, so fall back
  // to the name extracted from the URL slug.
  const name = props?.name ?? nameFromSlug;
  const image = props?.image;

  // layout.tsx template appends " – Openmap.lt", so return just the name here
  const ogTitle = name ? `${name} – Openmap.lt` : undefined;
  const desc = buildPoiDescription(name, mapType);

  return {
    ...(name && { title: name }),
    ...(desc && { description: desc }),
    alternates: { canonical },
    openGraph: {
      ...(ogTitle && { title: ogTitle }),
      ...(desc && { description: desc }),
      url: canonical,
      ...(image && { images: [{ url: image }] }),
    },
  };
}

export default async function Page({ params }: PageProps<"/[[...slug]]">) {
  const { slug } = await params;
  const { mapType, poiSlug, poiId } = parsePoiSlug(slug);

  const DB_POI_PROFILES = new Set(["places", "craftbeer", "saugomos"]);

  let poiData = null;
  if (poiId && /^\d+$/.test(poiId) && mapType && DB_POI_PROFILES.has(mapType)) {
    poiData = await getPoiInfo(poiId, mapType);
    if (!poiData || Object.entries(poiData).length === 0) {
      notFound();
    }
  }

  // Redirect if the slug name is stale (POI was renamed)
  if (poiData && mapType && poiId && poiSlug) {
    const currentName = (
      poiData.properties as Record<string, string | undefined> | null
    )?.name;
    if (currentName) {
      const correctSlug = `${poiId}-${slugify(currentName)}`;
      if (poiSlug !== correctSlug) {
        permanentRedirect(`/${mapType}/${correctSlug}`);
      }
    }
  }

  return (
    <>
      <MapPage
        initialPoiData={
          poiData && Object.entries(poiData).length > 0 ? poiData : null
        }
      />
      <HelpButton />
    </>
  );
}
