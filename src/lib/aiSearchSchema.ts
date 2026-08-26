import "server-only";

import { z } from "zod";
import {
  ALL_PLACE_TYPE_CODES,
  ALL_TAG_FILTER_IDS,
} from "@/config/ai-search-catalog";
import { resolveTagFilterId, sanitizeTypes } from "@/lib/aiSearchCatalog";

// This is the JSON contract the LLM produces and that places.ai_search
// (sql/ai_search.sql) expects — minus bbox/pos, which the server attaches
// from the client's map viewport, never the model.
//
// "types"/"tagFilterIds" are z.enum() arrays, not free text — the model
// physically cannot write a value outside the catalog (schema-level
// constraint, not just a prompt instruction). With a free string field,
// smaller/faster models sometimes dumped the whole catalog into the field
// value; an enum array rules that out.
export const AiSearchGroupSchema = z.object({
  // max(3): with the full ~54-code catalog and a looser limit, this model
  // sometimes returned dozens of codes instead of the 1-3 relevant ones.
  types: z.array(z.enum(ALL_PLACE_TYPE_CODES)).max(3).default([]),

  tagFilterIds: z.array(z.enum(ALL_TAG_FILTER_IDS)).max(4).default([]),

  // Free-text Lithuanian synonyms also matched against (name/description
  // tsvector+trigram) — for concepts with no structural type/tag match,
  // e.g. "itališkas maistas" has no cuisine data at all. Free text is safe
  // here — it's always a bound query parameter, never SQL syntax (see
  // sql/ai_search.sql).
  keywords: z.array(z.string().min(1).max(40)).max(6).default([]),
});

export const AiSearchPlanSchema = z.object({
  // Groups are OR'd together (compound queries, e.g. "itališko maisto ir
  // lietuviško craft alaus" = two groups). Capped at 4.
  groups: z.array(AiSearchGroupSchema).min(1).max(4),

  // Route intent — never reaches SQL (unlike groups/places.ai_search); used
  // only in TS to decide whether to build a GraphHopper route through the
  // matched POIs (see src/app/api/ai-search/route.ts) and which profile to
  // request.
  route: z
    .object({
      requested: z.boolean().default(false),
      profile: z.enum(["foot", "bike", "car"]).default("foot"),
    })
    .default({ requested: false, profile: "foot" }),
});

export type AiSearchPlan = z.infer<typeof AiSearchPlanSchema>;

// places.ai_search (SQL) expects types as a joined string and tagFilters as
// {key,value} pairs, not enum ids — this is the shape sanitizePlan returns.
export type SanitizedAiSearchGroup = {
  types: string;
  tagFilters: { key: string; value: string }[];
  keywords: string[];
};

// The actual whitelist enforcement — not the Zod schema, which only checks
// shape. Never trust that the client or model already did this.
export function sanitizePlan(plan: AiSearchPlan): SanitizedAiSearchGroup[] {
  return plan.groups
    .map((g) => ({
      types: sanitizeTypes(g.types),
      tagFilters: g.tagFilterIds
        .map(resolveTagFilterId)
        .filter((f): f is NonNullable<typeof f> => f !== null)
        .map((f) => ({ key: f.key, value: f.value })),
      keywords: g.keywords
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, 6),
    }))
    .filter((g) => g.types || g.tagFilters.length > 0 || g.keywords.length > 0);
}
