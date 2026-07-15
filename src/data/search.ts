"use server";

import type { FeatureCollection } from "geojson";
import { query } from "@/lib/db";
import { checkRateLimit } from "@/lib/rateLimit";

const EMPTY_SEARCH_RESULT: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export async function search(
  text: string,
  pos: [number, number],
  mapType?: string | null,
): Promise<FeatureCollection> {
  if (await checkRateLimit("search")) {
    return EMPTY_SEARCH_RESULT;
  }

  if (text.length > 200) {
    return EMPTY_SEARCH_RESULT;
  }

  try {
    const result = await query("SELECT places.search($1::jsonb) as result", [
      JSON.stringify({
        text,
        pos,
        mapType,
      }),
    ]);

    if (result.rows.length > 0 && result.rows[0].result) {
      const data = result.rows[0].result;
      if (data && typeof data === "object" && "error" in data) {
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
