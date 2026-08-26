import type { FeatureCollection } from "geojson";
import type { SanitizedAiSearchGroup } from "@/lib/aiSearchSchema";
import { queryResult } from "@/lib/db";

type AiSearchDbResult = FeatureCollection | { error: string };

const EMPTY_RESULT: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

// A group with both a structural filter (types/tagFilters) and keywords
// ANDs them together in sql/ai_search.sql — correct when keywords narrow
// to one named place (e.g. type "r" + keyword "Špunka"), but the model
// (see buildFirstCallSystemPrompt rule 8 in aiSearchClient.ts) sometimes
// pairs an exact types/tagFilters match with generic synonym keywords it
// should have left empty (e.g. "craftinis alus" next to types=["r"] +
// tagFilterIds=["real_ale=*"]) — those words never appear literally in a
// place's name/description, so the AND turns an otherwise-exact match into
// zero results.
function hasStructuralWithKeywords(groups: SanitizedAiSearchGroup[]): boolean {
  return groups.some(
    (g) => (g.types || g.tagFilters.length > 0) && g.keywords.length > 0,
  );
}

function dropKeywordsFromStructuralGroups(
  groups: SanitizedAiSearchGroup[],
): SanitizedAiSearchGroup[] {
  return groups.map((g) =>
    g.types || g.tagFilters.length > 0 ? { ...g, keywords: [] } : g,
  );
}

async function runAiSearch(
  groups: SanitizedAiSearchGroup[],
  pos: [number, number],
): Promise<FeatureCollection> {
  const result = await queryResult<AiSearchDbResult>(
    "SELECT places.ai_search($1::jsonb) as result",
    [JSON.stringify({ groups, pos })],
  );

  if (result && "error" in result) {
    console.error("ai_search error from DB:", result.error);
    return EMPTY_RESULT;
  }

  return result ?? EMPTY_RESULT;
}

export async function searchPlacesForAi(
  groups: SanitizedAiSearchGroup[],
  pos: [number, number],
): Promise<FeatureCollection> {
  if (groups.length === 0) return EMPTY_RESULT;

  const result = await runAiSearch(groups, pos);

  // Exact query came back empty and at least one group could have been
  // over-narrowed by keywords — retry once with keywords dropped from
  // groups that already have a structural filter (groups relying on
  // keywords alone are left untouched, since dropping their only filter
  // would just return unrelated places).
  if (result.features.length === 0 && hasStructuralWithKeywords(groups)) {
    return runAiSearch(dropKeywordsFromStructuralGroups(groups), pos);
  }

  return result;
}
