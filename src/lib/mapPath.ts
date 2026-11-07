// Map URLs are `/<mapType>[/<poiId>-<name>]`. User-created profiles live under
// a fixed prefix instead, `/m/<slug>[/<poiId>-<name>]`, so a user's slug can
// never collide with a page we add later at the top level.
//
// To keep every existing `/${mapType}/...` URL builder working untouched, a
// custom profile's `mapType` is simply `m/<slug>`. Plain data and string
// helpers only — used by server and client code alike.

export const CUSTOM_PROFILE_PREFIX = "m";

export function customMapType(slug: string): string {
  return `${CUSTOM_PROFILE_PREFIX}/${slug}`;
}

export function isCustomMapType(mapType: string | undefined): boolean {
  return mapType?.startsWith(`${CUSTOM_PROFILE_PREFIX}/`) ?? false;
}

// The slug part of a custom `mapType`, or null for a built-in one.
export function customSlugOf(mapType: string | undefined): string | null {
  return mapType && isCustomMapType(mapType)
    ? mapType.slice(CUSTOM_PROFILE_PREFIX.length + 1)
    : null;
}

// Splits the path segments after the leading slash (`["m", "my-map", "12-x"]`
// or `["places", "12-x"]`) into the profile's `mapType` and the POI segment.
export function parseMapPathSegments(segments: (string | undefined)[]): {
  mapType: string | undefined;
  poiSlug: string | undefined;
} {
  const [first, second, third] = segments;
  if (first === CUSTOM_PROFILE_PREFIX) {
    return {
      mapType: second ? customMapType(second) : undefined,
      poiSlug: third,
    };
  }
  return { mapType: first, poiSlug: second };
}
