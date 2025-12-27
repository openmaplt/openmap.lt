"use server";

import type { FeatureCollection } from "geojson";
import { query } from "@/lib/db";

const EMPTY_SEARCH_RESULT: FeatureCollection = {
  type: "FeatureCollection",
  features: [],
};

export async function search(
  text: string,
  pos: [number, number],
): Promise<FeatureCollection> {
  try {
    const result = await query("SELECT places.search($1::jsonb) as result", [
      JSON.stringify({
        text,
        pos,
      }),
    ]);

    if (result.rows.length > 0 && result.rows[0].result) {
      return result.rows[0].result;
    }
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }

  return EMPTY_SEARCH_RESULT;
}
