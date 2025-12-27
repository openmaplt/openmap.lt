"use server";

import { query } from "@/lib/db";

export async function getPoiList(bbox: number[], types: string) {
  try {
    const result = await query("SELECT places.list($1::jsonb) as result", [
      JSON.stringify({
        bbox,
        types,
      }),
    ]);

    if (result.rows.length > 0 && result.rows[0].result) {
      return result.rows[0].result;
    }
  } catch (error) {
    console.error("Error fetching POI list:", error);
    throw error;
  }

  return [];
}
