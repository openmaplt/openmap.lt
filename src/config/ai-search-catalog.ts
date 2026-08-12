import "server-only";

import { PLACES_FILTERS } from "@/config/places-filters";

// The only "types" codes the model may use — derived directly from
// PLACES_FILTERS, never duplicated by hand, so the AI catalog and the map's
// filter UI can't drift apart. These letters match
// places.get_where_condition's branches in the DB (unchanged, see
// sql/ai_search.sql).
//
// Tuple (not a plain array) so z.enum() (src/lib/aiSearchSchema.ts) can
// enforce this at the schema level — the model physically cannot write a
// code outside this list.
export const ALL_PLACE_TYPE_CODES = PLACES_FILTERS.flatMap((category) =>
  category.items.map((item) => item.id),
) as [string, ...string[]];

// Extra hints for the model's prompt only (see
// src/lib/aiSearchCatalog.ts buildPlaceTypeCatalogPrompt) — NOT the UI
// labels (PLACES_FILTERS.label drives the real map filter menu and stays
// untouched). Add entries only for confirmed ambiguities, not all 54 codes.
export const AI_PROMPT_HINTS: Record<string, string> = {
  b: "senoviniai žemės įtvirtinimai, NE mūrinės/akmeninės pilys",
  a: "ČIA patenka mūrinės/akmeninės pilys (pvz. „Kauno pilis“, „Trakų pilis“), rūmai, kiti istoriniai statiniai",
};

export type AiSearchTagFilter = {
  key: string;
  value: string;
  description: string;
};

// Exact attr key/value pairs, confirmed against real places.poi data — for
// concepts the PLACES_FILTERS letter catalog doesn't cover.
//
// Extend only after re-confirming against the live DB — never let the model
// invent a new key/value.
export const AI_SEARCH_TAG_FILTERS: AiSearchTagFilter[] = [
  {
    key: "shop",
    value: "bakery",
    description: "Kepyklos, duonos, bandelių parduotuvės",
  },
  { key: "shop", value: "butcher", description: "Mėsos parduotuvės" },
  { key: "shop", value: "alcohol", description: "Alkoholio parduotuvės" },
  {
    key: "real_ale",
    value: "yes",
    description:
      'Baras/alude su tikru (real/craft) alumi — naudoti su types="r" (aludės, barai)',
  },
];

// One "id" per whitelisted pair (e.g. "shop=bakery"), like
// ALL_PLACE_TYPE_CODES above, so z.enum() accepts only these ids — the
// model can't mix a key from one pair with a value from another.
export const ALL_TAG_FILTER_IDS = AI_SEARCH_TAG_FILTERS.map(
  (f) => `${f.key}=${f.value}`,
) as [string, ...string[]];
