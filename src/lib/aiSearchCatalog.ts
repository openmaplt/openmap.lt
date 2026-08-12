import "server-only";

import {
  AI_PROMPT_HINTS,
  AI_SEARCH_TAG_FILTERS,
  type AiSearchTagFilter,
  ALL_PLACE_TYPE_CODES,
} from "@/config/ai-search-catalog";
import { PLACES_FILTERS } from "@/config/places-filters";

const ALL_PLACE_TYPE_CODES_SET = new Set(ALL_PLACE_TYPE_CODES);

export function buildPlaceTypeCatalogPrompt(): string {
  return PLACES_FILTERS.map((category) =>
    category.items
      .map((item) => {
        const hint = AI_PROMPT_HINTS[item.id];
        return `${item.id}: ${item.label} (${category.label})${hint ? ` — ${hint}` : ""}`;
      })
      .join("\n"),
  ).join("\n");
}

// A second line of defense beyond the schema's z.enum() — whatever the
// model puts in the array, this re-checks it against the real catalog.
export function sanitizeTypes(types: string[]): string {
  return types.filter((code) => ALL_PLACE_TYPE_CODES_SET.has(code)).join("");
}

// Same "key=value" shape as ALL_TAG_FILTER_IDS (src/config/ai-search-catalog.ts)
// — duplicated on purpose so the config file stays data-only.
function tagFilterId(f: AiSearchTagFilter): string {
  return `${f.key}=${f.value}`;
}

export function resolveTagFilterId(id: string): AiSearchTagFilter | null {
  return AI_SEARCH_TAG_FILTERS.find((f) => tagFilterId(f) === id) ?? null;
}

export function buildTagFilterCatalogPrompt(): string {
  return AI_SEARCH_TAG_FILTERS.map(
    (f) => `${tagFilterId(f)}: ${f.description}`,
  ).join("\n");
}
