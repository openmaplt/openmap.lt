import "server-only";

import distance from "@turf/distance";
import { point } from "@turf/helpers";
import type { Feature, FeatureCollection, Point } from "geojson";
import { BASE_URL } from "@/config/config";
import { PLACES_FILTERS } from "@/config/places-filters";
import { searchPlacesForAi } from "@/data/aiSearch";
import { getPoiInfo } from "@/data/poiInfo";
import { resolveTagFilterId } from "@/lib/aiSearchCatalog";
import { query, queryResult } from "@/lib/db";
import {
  fetchGraphHopperRoute,
  orderNearestNeighbor,
  RouteNotFoundError,
} from "@/lib/geo";
import { slugify } from "@/lib/utils";

// Hard caps keep tool output small enough for an LLM context window. Radius is
// NOT what bounds output size (the result count is) and a large bbox is cheap
// (places.list over 50 km around Vilnius: ~1400 rows, ~120 ms), so it is
// generous — a car trip's "nearby" is tens of km, not 8.
export const MCP_MAX_RESULTS = 25;
export const MCP_MAX_RADIUS_KM = 100;
const NEAREST_OUTSIDE_RADIUS = 3;
const VALID_TYPE_CODES = new Set(
  PLACES_FILTERS.flatMap((group) => group.items.map((item) => item.id)),
);

type DbResult = FeatureCollection | { error: string };

// Canonical page of a POI on the site: `/places/<id>-<name-slug>` (the same
// shape page.tsx redirects to when the slug is stale, so it never bounces).
function poiUrl(id: string, name?: string | null) {
  const slug = name ? slugify(name) : "";
  return `${BASE_URL}/places/${id}${slug ? `-${slug}` : ""}`;
}

// Strip a DB feature down to what an LLM needs; the full attribute bag
// (opening hours, websites, ...) is available via get_poi.
function toCompactFeature(feature: Feature, distance?: number) {
  const props = feature.properties ?? {};
  const coords = (feature.geometry as Point | undefined)?.coordinates ?? [];
  const id = String(feature.id ?? props.id);
  return {
    id,
    name: props.name ?? null,
    url: poiUrl(id, props.name),
    type: props.TYPE ?? null,
    address: props.address ?? null,
    lat: coords[1] ?? null,
    lng: coords[0] ?? null,
    distance_m: distance !== undefined ? Math.round(distance) : undefined,
  };
}

// An empty list inside the radius must not read as "doesn't exist": hand the
// agent the nearest matches beyond it so it can say "nothing within 20 km,
// nearest is X, 85 km away" instead of "none".
function emptyWithNearest(features: Feature[], radiusKm: number) {
  return {
    results: [],
    searched_radius_km: radiusKm,
    nearest_outside_radius: features
      .slice(0, NEAREST_OUTSIDE_RADIUS)
      .map((f) => toCompactFeature(f, f.properties?.DIST)),
    note: features.length
      ? `Nothing within ${radiusKm} km. nearest_outside_radius lists the closest matches anywhere; retry with a larger radius_km (max ${MCP_MAX_RADIUS_KM}) if relevant.`
      : "Nothing found anywhere in the database for these filters.",
  };
}

// Fewer hits than asked for may just mean the radius was too tight — tell the
// agent so it can widen the search itself instead of reporting "only 2".
function widenHint(count: number, limit: number, radiusKm: number) {
  if (count >= limit || radiusKm >= MCP_MAX_RADIUS_KM) return {};
  return {
    searched_radius_km: radiusKm,
    note: `Only ${count} within ${radiusKm} km (limit ${limit}). If the user wants more or better options, retry with a larger radius_km (up to ${MCP_MAX_RADIUS_KM}).`,
  };
}

export function listPoiTypes() {
  return PLACES_FILTERS.map((group) => ({
    group: group.label,
    types: group.items.map((item) => ({ code: item.id, label: item.label })),
  }));
}

interface SettlementRow {
  name: string;
  place: string;
  population: number | null;
  lat: number;
  lng: number;
}

// Resolves a settlement/district name to coordinates from the OSM `place`
// nodes. Matching is trigram-based on unaccented names, so Lithuanian
// inflections ("Kaune", "Klaipedoje") still hit the nominative. Same-named
// places are common (Trakai is a town AND several villages), so exact matches
// rank first, then city > town > suburb > village, then population.
export async function findSettlement(name: string) {
  const result = await query(
    `SELECT name, place,
            CASE WHEN population ~ '^\\d+$' THEN population::int END AS population,
            ST_Y(ST_Transform(way, 4326)) AS lat,
            ST_X(ST_Transform(way, 4326)) AS lng
       FROM public.planet_osm_point
      WHERE place IN ('city','town','suburb','quarter','neighbourhood','village','hamlet','island')
        AND name IS NOT NULL
        AND public.unaccent(name) % public.unaccent($1)
      ORDER BY (lower(public.unaccent(name)) = lower(public.unaccent($1))) DESC,
               CASE place WHEN 'city' THEN 0 WHEN 'town' THEN 1
                          WHEN 'suburb' THEN 2 WHEN 'quarter' THEN 2
                          WHEN 'neighbourhood' THEN 2 WHEN 'island' THEN 2
                          ELSE 3 END,
               COALESCE(CASE WHEN population ~ '^\\d+$' THEN population::int END, 0) DESC,
               similarity(public.unaccent(name), public.unaccent($1)) DESC
      LIMIT 5`,
    [name.trim()],
  );
  return {
    results: (result.rows as SettlementRow[]).map((r) => ({
      name: r.name,
      kind: r.place,
      population: r.population,
      lat: r.lat,
      lng: r.lng,
    })),
  };
}

export function sanitizeTypeCodes(types: string) {
  const codes = [...new Set(types.split(""))].filter((c) =>
    VALID_TYPE_CODES.has(c),
  );
  return codes.join("");
}

export async function findPlacesNearby(args: {
  lat: number;
  lng: number;
  types: string;
  radiusKm: number;
  limit: number;
}) {
  const types = sanitizeTypeCodes(args.types);
  if (!types) return { error: "No valid type codes. Call list_poi_types." };

  const radiusKm = Math.min(args.radiusKm, MCP_MAX_RADIUS_KM);
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.cos((args.lat * Math.PI) / 180));
  const bbox = [
    args.lng - dLng,
    args.lat - dLat,
    args.lng + dLng,
    args.lat + dLat,
  ];

  const result = await queryResult<DbResult>(
    "SELECT places.list($1::jsonb) as result",
    [JSON.stringify({ bbox, types })],
  );
  if (!result || "error" in result) return { results: [] };

  const results = result.features
    .map((f) => {
      const [lng, lat] = (f.geometry as Point).coordinates;
      return {
        feature: f,
        distance:
          distance(point([args.lng, args.lat]), point([lng, lat])) * 1000,
      };
    })
    .filter((r) => r.distance <= radiusKm * 1000)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, Math.min(args.limit, MCP_MAX_RESULTS))
    .map((r) => toCompactFeature(r.feature, r.distance));

  if (results.length === 0) {
    const nearest = await searchPlacesForAi(
      [{ types, tagFilters: [], keywords: [] }],
      [args.lng, args.lat],
    );
    return emptyWithNearest(nearest.features, radiusKm);
  }
  return { results, ...widenHint(results.length, args.limit, radiusKm) };
}

export async function searchPlacesByText(args: {
  text: string;
  lat: number;
  lng: number;
  limit: number;
}) {
  const result = await queryResult<DbResult>(
    "SELECT places.search($1::jsonb) as result",
    // mapType "places" is required: without it places.search queries
    // public.search_map, whose ids (and address rows) don't match places.poi
    // ids, so the ids would resolve to the wrong POI in get_poi.
    [
      JSON.stringify({
        text: args.text,
        pos: [args.lng, args.lat],
        mapType: "places",
      }),
    ],
  );
  if (!result || "error" in result) return { results: [] };

  const results = result.features
    .slice(0, Math.min(args.limit, MCP_MAX_RESULTS))
    .map((f) => toCompactFeature(f, f.properties?.DIST));
  return { results };
}

export async function getPoiDetails(id: string) {
  // Without mapType the DB function silently returns {} instead of failing.
  const info = await getPoiInfo(id, "places");
  if (!info?.properties) return { error: "POI not found" };
  return {
    id: info.id,
    url: poiUrl(String(info.id), info.properties.name),
    type: info.type,
    geometry: info.geometry,
    properties: info.properties,
  };
}

// Structured filter search on top of places.ai_search — the only way to reach
// attr tags (shop=bakery, real_ale) and description keywords. Tag ids and
// type codes go through the same whitelist as the admin AI chat; keywords stay
// bound query parameters inside the SQL function.
export async function findPlacesFiltered(args: {
  lat: number;
  lng: number;
  types: string;
  tagFilterIds: string[];
  keywords: string[];
  radiusKm: number;
  limit: number;
}) {
  const group = {
    types: sanitizeTypeCodes(args.types),
    tagFilters: args.tagFilterIds
      .map(resolveTagFilterId)
      .filter((f): f is NonNullable<typeof f> => f !== null)
      .map((f) => ({ key: f.key, value: f.value })),
    keywords: args.keywords.map((k) => k.trim()).filter(Boolean),
  };
  if (!group.types && !group.tagFilters.length && !group.keywords.length) {
    return { error: "Give at least one of types, tag_filters, keywords." };
  }

  // places.ai_search has no radius: it returns the 25 nearest matches however
  // far away, so cap the distance here — otherwise "butchers in Šiauliai"
  // answers with one 100 km away.
  const result = await searchPlacesForAi([group], [args.lng, args.lat]);
  const radiusKm = Math.min(args.radiusKm, MCP_MAX_RADIUS_KM);
  const results = result.features
    .filter((f) => (f.properties?.DIST ?? Infinity) <= radiusKm * 1000)
    .slice(0, Math.min(args.limit, MCP_MAX_RESULTS))
    .map((f) => toCompactFeature(f, f.properties?.DIST));
  if (results.length === 0) return emptyWithNearest(result.features, radiusKm);
  return { results, ...widenHint(results.length, args.limit, radiusKm) };
}

export type RoutePoint = { lat: number; lng: number; name?: string };

// A route's long instructions are what a human would call "the way": the
// motorway legs, not every roundabout. Threshold scales with trip length so a
// 3 km walk and a 330 km drive both get a readable summary.
function summarizeInstructions(
  instructions: { text?: string; distance: number }[],
  totalM: number,
) {
  const minM = Math.min(10_000, Math.max(300, totalM * 0.05));
  return instructions
    .filter((i) => i.text && i.distance >= minM)
    .slice(0, 12)
    .map((i) => ({ text: i.text, km: Math.round(i.distance / 100) / 10 }));
}

// Routing through the same GraphHopper instance as the web app. GraphHopper
// visits points in the given order and has no optimize mode, so
// optimize_order reorders everything after the first point with the same
// greedy nearest-neighbor heuristic the AI chat uses (not a real TSP solve).
export async function getRoute(args: {
  points: RoutePoint[];
  profile: "car" | "foot" | "bike";
  optimizeOrder: boolean;
}) {
  const [first, ...rest] = args.points;
  const stops = args.optimizeOrder
    ? [first, ...orderNearestNeighbor([first.lng, first.lat], rest)]
    : args.points;

  try {
    const path = await fetchGraphHopperRoute(
      stops.map((p) => [p.lng, p.lat]),
      args.profile,
    );
    const last = stops[stops.length - 1];

    // The web app's URL state only encodes start/end — via points can't be
    // shared, so a map link is offered for plain A→B routes only.
    const mapUrl =
      stops.length === 2
        ? `${BASE_URL}/?${new URLSearchParams({
            startLat: first.lat.toFixed(5),
            startLng: first.lng.toFixed(5),
            ...(first.name ? { startName: first.name } : {}),
            endLat: last.lat.toFixed(5),
            endLng: last.lng.toFixed(5),
            ...(last.name ? { endName: last.name } : {}),
            profile: args.profile,
          })}`
        : undefined;

    return {
      profile: args.profile,
      distance_km: Math.round(path.distance / 100) / 10,
      duration_min: Math.round(path.time / 60000),
      stops: stops.map((p, i) => ({ order: i + 1, ...p })),
      main_legs: summarizeInstructions(
        path.instructions as { text?: string; distance: number }[],
        path.distance,
      ),
      url_to_show_user: mapUrl,
    };
  } catch (error) {
    // GraphHopper answers 400 for a point it cannot snap to the road network
    // (sea, forest, abroad) — that is "no route", not "service down".
    const isClientError =
      error instanceof Error && /status: (400|404)/.test(error.message);
    if (error instanceof RouteNotFoundError || isClientError) {
      return {
        error:
          "No route found: a point may be too far from roads for this profile, or the points are not connected.",
      };
    }
    console.error("MCP get_route error:", error);
    return { error: "Routing service unavailable, try again later." };
  }
}
