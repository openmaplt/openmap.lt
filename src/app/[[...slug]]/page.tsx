import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { MapMenu } from "@/components/MapMenu";
import { BASE_URL } from "@/config/config";
import { POI_INFO_PROFILES } from "@/config/map-profiles";
import { getPoiInfo } from "@/data/poiInfo";
import { customSlugOf } from "@/lib/mapPath";
import { buildPoiDescription, parsePoiSlug } from "@/lib/poiHelpers";
import { slugify } from "@/lib/utils";
import {
  getOpenedProfile,
  getViewer,
  getViewerProfiles,
} from "@/lib/viewerProfiles";
import MapPage from "./_components/MapPage";
import { PoiSeoContent } from "./_components/PoiSeoContent";

// `?k=` share key of a `link` profile (see src/lib/profileAccess.ts).
function shareKeyFrom(searchParams: { k?: string | string[] }): string | null {
  const value = searchParams.k;
  return typeof value === "string" && value ? value : null;
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug?: string[] }>;
  searchParams: Promise<{ k?: string | string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { mapType, poiSlug, poiId, nameFromSlug } = parsePoiSlug(slug);

  const customSlug = customSlugOf(mapType);
  if (customSlug) {
    const viewer = await getViewer();
    const opened = await getOpenedProfile(
      customSlug,
      viewer?.id ?? null,
      shareKeyFrom(await searchParams),
    );
    // A map the visitor may not see is a 404 (the page renders notFound());
    // nothing about it may leak into the metadata either.
    if (!opened) {
      return { robots: { index: false, follow: false } };
    }
    return {
      title: opened.profile.name,
      ...(opened.indexable
        ? { alternates: { canonical: `${BASE_URL}/${mapType}` } }
        : { robots: { index: false, follow: false } }),
    };
  }

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
      type: "website",
      siteName: "Openmap.lt",
      locale: "lt_LT",
      ...(ogTitle && { title: ogTitle }),
      ...(desc && { description: desc }),
      url: canonical,
      ...(image && { images: [{ url: image }] }),
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: PageProps<"/[[...slug]]">) {
  const { slug } = await params;
  const { mapType, poiSlug, poiId } = parsePoiSlug(slug);

  // User-created profiles: whoever the map is shared with sees it plus the base
  // profiles; anyone else gets a plain 404.
  const viewer = await getViewer();
  const shareKey = shareKeyFrom(await searchParams);
  const customSlug = customSlugOf(mapType);
  const opened = customSlug
    ? await getOpenedProfile(customSlug, viewer?.id ?? null, shareKey)
    : null;
  if (customSlug && !opened) {
    notFound();
  }
  const extraProfiles = await getViewerProfiles(
    viewer?.id ?? null,
    opened?.profile ?? null,
    shareKey,
  );

  let poiData = null;
  if (
    poiId &&
    /^\d+$/.test(poiId) &&
    mapType &&
    POI_INFO_PROFILES.has(mapType)
  ) {
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

  const hasPoiData = poiData && Object.entries(poiData).length > 0;

  return (
    <>
      {hasPoiData && mapType && poiSlug && (
        <PoiSeoContent
          poiData={poiData}
          url={`${BASE_URL}/${mapType}/${poiSlug}`}
        />
      )}
      <MapPage
        initialPoiData={hasPoiData ? poiData : null}
        extraProfiles={extraProfiles}
      />
      <MapMenu />
    </>
  );
}
