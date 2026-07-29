"use server";

import type { FeatureCollection } from "geojson";
import { queryResult } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";
import { searchProtectedAreas } from "@/lib/stvk";

const EMPTY_SEARCH_RESULT: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export async function search(
  text: string,
  pos: [number, number],
  mapType?: string | null,
): Promise<FeatureCollection> {
  if (await checkRateLimit("search", "frequent")) {
    return EMPTY_SEARCH_RESULT;
  }

  if (text.length > 200) {
    return EMPTY_SEARCH_RESULT;
  }

  // Protected areas ("saugomos") come straight from the STVK API — we no longer
  // mirror them in our DB. Everything else stays on places.search.
  if (mapType === "saugomos") {
    return searchProtectedAreas(text, pos);
  }

  try {
    const result = await queryResult(
      "SELECT places.search($1::jsonb) as result",
      [JSON.stringify({ text, pos, mapType })],
    );

    if (result) {
      const data = result as FeatureCollection | { error: string };
      if ("error" in data) {
        console.error("Search error from DB:", data.error);
        return EMPTY_SEARCH_RESULT;
      }

      return data;
    }
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }

  return EMPTY_SEARCH_RESULT;
}
