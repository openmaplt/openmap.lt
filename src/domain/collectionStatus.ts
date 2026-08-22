// Mirrors the Postgres enum openmap.poi_collection_status_value
// (sql/collections.sql) — a fixed set that can't change without a DB
// migration, unlike a config catalog. Shared by server
// (src/lib/collectionStatus.ts) and client
// (src/components/collections/PoiCollectionStatus.tsx) code, so this file
// must stay free of "server-only".
export const POI_COLLECTION_STATUS = {
  VISITED: "visited",
  NOT_INTERESTING: "not_interesting",
} as const;

export type PoiCollectionStatusValue =
  (typeof POI_COLLECTION_STATUS)[keyof typeof POI_COLLECTION_STATUS];

// UI-only sentinel meaning "no status row saved" (see
// src/lib/collectionStatus.ts: row absence IS "unvisited") — never stored in
// the DB, but needed as a real Select value since Radix Select has no null
// option.
export const POI_COLLECTION_UNVISITED = "unvisited";

export type PoiCollectionStatusOption =
  | typeof POI_COLLECTION_UNVISITED
  | PoiCollectionStatusValue;

// Map legend filter — which subset of collected-type POIs to show on the
// map. Separate from PoiCollectionStatusOption above (that one has no "all"
// value — "all" only makes sense for a map view, not a single POI's
// status). Reuses the same underlying strings, never re-typed.
export const POI_COLLECTION_MAP_FILTER = {
  ALL: "all",
  UNVISITED: POI_COLLECTION_UNVISITED,
  VISITED: POI_COLLECTION_STATUS.VISITED,
  NOT_INTERESTING: POI_COLLECTION_STATUS.NOT_INTERESTING,
} as const;

export type PoiCollectionMapFilter =
  (typeof POI_COLLECTION_MAP_FILTER)[keyof typeof POI_COLLECTION_MAP_FILTER];

// places.list (sql/places_list.sql) expects a single-letter code for every
// non-"all" filter value.
export const POI_COLLECTION_MAP_FILTER_CODE: Record<
  Exclude<PoiCollectionMapFilter, typeof POI_COLLECTION_MAP_FILTER.ALL>,
  "n" | "a" | "i"
> = {
  [POI_COLLECTION_MAP_FILTER.UNVISITED]: "n",
  [POI_COLLECTION_MAP_FILTER.VISITED]: "a",
  [POI_COLLECTION_MAP_FILTER.NOT_INTERESTING]: "i",
};
