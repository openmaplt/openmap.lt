import type { FeatureCollection } from "geojson";
import type { SanitizedAiSearchGroup } from "@/lib/aiSearchSchema";
import { queryResult } from "@/lib/db";

type AiSearchDbResult = FeatureCollection | { error: string };

const EMPTY_RESULT: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

// Tried a fallback here that dropped keywords from groups that also had a
// structural filter (types/tagFilters) whenever the exact query came back
// empty, meant to recover from the model pairing an exact tag match with a
// redundant synonym keyword (see buildFirstCallSystemPrompt rule 8 in
// aiSearchClient.ts). Reverted: it can't be told apart from a keyword that
// IS the query's only location anchor (e.g. "kas įdomaus Palangoje" asked
// while the map is centered on Kaunas — types=["a"] + keywords=["Palanga"]
// legitimately finds nothing near Kaunas). Dropping the keyword there
// silently substitutes an unrelated city's results for a real "nothing
// found here" answer — worse than the empty result it was meant to fix.
export async function searchPlacesForAi(
  groups: SanitizedAiSearchGroup[],
  pos: [number, number],
): Promise<FeatureCollection> {
  if (groups.length === 0) return EMPTY_RESULT;

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
