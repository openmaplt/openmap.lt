import type { FeatureCollection } from "geojson";
import type { SanitizedAiSearchGroup } from "@/lib/aiSearchSchema";
import { queryResult } from "@/lib/db";

type AiSearchDbResult = FeatureCollection | { error: string };

const EMPTY_RESULT: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export async function searchPlacesForAi(
  groups: SanitizedAiSearchGroup[],
  bbox: number[],
  pos: [number, number],
): Promise<FeatureCollection> {
  if (groups.length === 0) return EMPTY_RESULT;

  const result = await queryResult<AiSearchDbResult>(
    "SELECT places.ai_search($1::jsonb) as result",
    [JSON.stringify({ groups, bbox, pos })],
  );

  if (result && "error" in result) {
    console.error("ai_search error from DB:", result.error);
    return EMPTY_RESULT;
  }

  return result ?? EMPTY_RESULT;
}
