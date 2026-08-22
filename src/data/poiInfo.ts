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

    if (data && typeof data === "object") {
      // Check if the returned object contains an error field (as per PL/SQL function behavior)
      if ("error" in data) {
        console.error("POI Info error from DB:", data.error);
        return null;
      }

      // `type` (the places.poi 3-letter category, e.g. "PUB") comes back as a
      // sibling of `properties`, not inside it — fold it in as `TYPE` so it
      // reaches the client the same way places.list already exposes it.
      if (data.type && data.properties && typeof data.properties === "object") {
        data.properties = { ...data.properties, TYPE: data.type };
      }

      // `filter` (the single-letter PLACES_FILTERS code, e.g. "r") is also a
      // sibling of `properties` — fold it in as FILTER_CODE so components can
      // check it against a user's collected type codes without a second
      // lookup table.
      if (
        data.filter &&
        data.properties &&
        typeof data.properties === "object"
      ) {
        data.properties = { ...data.properties, FILTER_CODE: data.filter };
      }

      return data;
    }
  } catch (error) {
    console.error("Error fetching POI info:", error);
    throw error;
  }

  return null;
});
