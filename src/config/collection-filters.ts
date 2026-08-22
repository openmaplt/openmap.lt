import {
  FILTER_GROUP_ID,
  type FilterCategory,
  PLACES_FILTERS,
} from "@/config/places-filters";

// The legend groups exposed on /paskyra/kolekcionavimas — a deliberate
// subset of the full map legend, kept in the same order/hierarchy as
// PLACES_FILTERS. Referenced by FILTER_GROUP_ID symbol (never a re-typed
// string) so renaming a group's id in places-filters.ts can't silently drift
// out of sync with this list.
const COLLECTION_FILTER_GROUP_IDS = [
  FILTER_GROUP_ID.HERITAGE,
  FILTER_GROUP_ID.TOURISM,
  FILTER_GROUP_ID.FOOD,
  FILTER_GROUP_ID.RELIGION,
] as const;

export const COLLECTION_FILTERS: FilterCategory[] = PLACES_FILTERS.filter(
  (category) =>
    (COLLECTION_FILTER_GROUP_IDS as readonly string[]).includes(category.id),
);

// FILTER_GROUP_ID symbols only guard against renaming/removing a group's id;
// they don't guard against deleting the whole PLACES_FILTERS entry outright,
// so this stays as a fail-fast backstop for that case.
if (COLLECTION_FILTERS.length !== COLLECTION_FILTER_GROUP_IDS.length) {
  throw new Error(
    "COLLECTION_FILTER_GROUP_IDS references a PLACES_FILTERS group id that no longer exists.",
  );
}

// Flattened whitelist for server-side validation (src/actions/collections.ts)
// — kept in lockstep with COLLECTION_FILTERS so the action can never accept
// a type code the UI couldn't have produced.
export const COLLECTION_TYPE_CODES: string[] = COLLECTION_FILTERS.flatMap(
  (category) => category.items.map((item) => item.id),
);
