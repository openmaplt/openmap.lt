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
