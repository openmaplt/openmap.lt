"use server";

import { cache } from "react";
import { queryResult } from "@/lib/db";
import { getProtectedArea } from "@/lib/stvk";

export const getPoiInfo = cache(async function getPoiInfo(
  id: string,
  mapType?: string | null,
) {
  // Protected areas ("saugomos") come straight from the STVK API — we no
  // longer mirror them in our DB. Everything else stays on places.poi_info.
  if (mapType === "saugomos") {
    return getProtectedArea(id);
  }

  try {
    const data = await queryResult(
      "SELECT places.poi_info($1::jsonb) as result",
      [JSON.stringify({ id, mapType })],
    );

    if (data) {
      // Check if the returned object contains an error field (as per PL/SQL function behavior)
      if (typeof data === "object" && "error" in data) {
        console.error("POI Info error from DB:", data.error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error("Error fetching POI info:", error);
    throw error;
  }

  return null;
});
