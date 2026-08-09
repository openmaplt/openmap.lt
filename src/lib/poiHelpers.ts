import type { FilterSpecification } from "@maplibre/maplibre-gl-style-spec";
import type { Feature } from "geojson";
import type { Map as MapLibreMap } from "maplibre-gl";
import { MAP_PROFILES } from "@/config/map-profiles";

/**
 * Turns an OSM `wikipedia` tag ("lt:Aknystėlių piliakalnis") into a link.
 * The tag is user-editable, so the language is restricted to a plain code —
 * this prevents injecting an arbitrary host into the URL.
 */
export function formatWikipediaUrl(
  value: string,
): { url: string; title: string } | null {
  const [lang, ...rest] = value.split(":");
  const title = rest.join(":");
  if (!/^[a-z-]{2,20}$/.test(lang) || !title) {
    return null;
  }
  const url = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
    title.replace(/\s/g, "_"),
  )}`;
  return { url, title };
}

export function buildPoiDescription(
  name: string | undefined,
  mapType: string | undefined,
): string | undefined {
  if (!name) return undefined;
  const profile = MAP_PROFILES.find((p) => p.mapType === mapType);
  const template =
    profile?.seoDescription ?? "{name}. Rask žemėlapyje openmap.lt.";
  return template.replace("{name}", name);
}

/**
 * Link to a POI from a comment (moderation queue, "Mano komentarai") given
 * the map_profile_id + object_ref it was posted under. Returns null if the
 * profile id no longer resolves (e.g. a renamed/removed map profile) — the
 * caller should fall back to rendering plain text in that case.
 */
export function buildCommentPoiHref(
  mapProfileId: string,
  objectRef: string,
): string | null {
  const profile = MAP_PROFILES.find((p) => p.id === mapProfileId);
  if (!profile) return null;
  return `/${profile.mapType}/${objectRef}`;
}

/**
 * GET /api/comments URL (and matching SWR key) for a POI's comment thread,
 * given the map_profile_id + object_ref it's posted under.
 */
export function buildCommentsApiUrl(
  mapProfileId: string,
  objectRef: string,
): string {
  const params = new URLSearchParams({
    profile: mapProfileId,
    ref: objectRef,
  });
  return `/api/comments?${params}`;
}

/**
 * GET /api/photos URL (and matching SWR key) for a POI's uploaded-photo set,
 * given the map_profile_id + object_ref it's posted under — mirrors
 * buildCommentsApiUrl.
 */
export function buildPhotosApiUrl(
  mapProfileId: string,
  objectRef: string,
): string {
  const params = new URLSearchParams({
    profile: mapProfileId,
    ref: objectRef,
  });
  return `/api/photos?${params}`;
}

export function parsePoiSlug(slug: string[] | undefined) {
  const mapType = slug?.[0] ?? undefined;
  const poiSlug = slug?.[1] ?? undefined;
  const poiId =
    poiSlug && poiSlug !== "map" ? poiSlug.split("-")[0] : undefined;
  const nameFromSlug =
    poiSlug && poiId
      ? poiSlug
          .slice(poiId.length + 1)
          .replace(/-/g, " ")
          .replace(/^\w/, (c) => c.toUpperCase()) || undefined
      : undefined;
  return { mapType, poiSlug, poiId, nameFromSlug };
}

/**
 * Query and extract POI feature by object ID
 */
export function getPoiFromObjectId(
  map: MapLibreMap,
  layerId: string,
  objectId: string,
): Feature | null {
  if (!map.getLayer(layerId)) {
    return null;
  }

  // Query for the feature
  const parsedId = Number.parseInt(objectId, 10);
  const filter = (
    Number.isNaN(parsedId)
      ? ["==", "id", objectId]
      : ["any", ["==", "id", objectId], ["==", "id", parsedId]]
  ) as FilterSpecification;

  const features = map.queryRenderedFeatures({
    layers: [layerId],
    filter,
  });

  if (features.length > 0) {
    return features[0] as Feature;
  }

  return null;
}
