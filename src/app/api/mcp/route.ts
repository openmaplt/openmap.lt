import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { ALL_TAG_FILTER_IDS } from "@/config/ai-search-catalog";
import { logMcpRequest, logToolResults } from "@/lib/mcp/logging";
import {
  findPlacesFiltered,
  findPlacesNearby,
  findSettlement,
  getPoiDetails,
  getRoute,
  listPoiTypes,
  MCP_MAX_RADIUS_KM,
  MCP_MAX_RESULTS,
  searchPlacesByText,
} from "@/lib/mcp/tools";
import { checkRateLimit } from "@/lib/rateLimit";

// Read-only, public MCP server over the places POI data. No LLM runs here —
// the calling agent supplies structured arguments, which are validated
// (zod + type-code whitelist) before touching the existing PL/SQL functions.
// Route Handler rather than a server action: MCP is an HTTP protocol.
const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value) }],
});

const lat = z.number().min(53.8).max(56.5).describe("Latitude (Lithuania)");
const lng = z.number().min(20.9).max(26.9).describe("Longitude (Lithuania)");

type McpServer = Parameters<Parameters<typeof createMcpHandler>[0]>[0];

function registerTools(server: McpServer) {
  server.registerTool(
    "list_poi_types",
    {
      title: "List POI type codes",
      description:
        "Lists the single-letter POI type codes (e.g. 'i' = museums, 'h' = tourist attractions, 'q' = restaurants) grouped by category. Call this before find_places_nearby.",
      inputSchema: z.object({}),
      annotations: { readOnlyHint: true },
    },
    async () => text(listPoiTypes()),
  );

  server.registerTool(
    "find_settlement",
    {
      title: "Find settlement coordinates",
      description:
        "Resolves a Lithuanian city, town, district or village name to coordinates (any inflection, with or without diacritics, e.g. 'Kaune', 'Klaipedoje'). Returns up to 5 candidates best-first; same-named places exist, so check `kind` and `population`. Use lat/lng with the other tools.",
      inputSchema: z.object({ name: z.string().min(2).max(100) }),
      annotations: { readOnlyHint: true },
    },
    async ({ name }) => {
      if (await checkRateLimit("mcp", "standard")) {
        return { ...text({ error: "Rate limited" }), isError: true };
      }
      return text(await findSettlement(name));
    },
  );

  server.registerTool(
    "find_places_nearby",
    {
      title: "Find places nearby",
      description: `Lists ALL points of interest of the given categories (type codes from list_poi_types) within a radius, nearest first. Use for category browsing ("museums in Kaunas"). Cannot filter by tags or keywords — use find_places for that, or search_places_by_name when you know the name. Start with a modest radius and widen it yourself (up to ${MCP_MAX_RADIUS_KM} km) when the result says there are too few. Max ${MCP_MAX_RESULTS} results.`,
      inputSchema: z.object({
        lat,
        lng,
        types: z
          .string()
          .min(1)
          .max(40)
          .describe(
            "Concatenated type codes from list_poi_types, e.g. 'hi' = attractions + museums",
          ),
        radius_km: z
          .number()
          .min(0.1)
          .max(MCP_MAX_RADIUS_KM)
          .default(20)
          .describe(
            "Search radius in km. Generous by default; an empty result also returns the nearest matches beyond it.",
          ),
        limit: z.number().int().min(1).max(MCP_MAX_RESULTS).default(10),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ lat, lng, types, radius_km, limit }) => {
      if (await checkRateLimit("mcp", "standard")) {
        return { ...text({ error: "Rate limited" }), isError: true };
      }
      return text(
        await findPlacesNearby({
          lat,
          lng,
          types,
          radiusKm: radius_km,
          limit,
        }),
      );
    },
  );

  server.registerTool(
    "search_places_by_name",
    {
      title: "Search places by name",
      description:
        "Finds a specific place when you know (part of) its NAME or address, e.g. 'Trakų salos pilis'. Ranked by name match quality, then distance. Do NOT use it to look for a kind of place (bakeries, craft beer) — names rarely contain the category; use find_places or find_places_nearby.",
      inputSchema: z.object({
        text: z.string().min(2).max(200),
        lat,
        lng,
        limit: z.number().int().min(1).max(MCP_MAX_RESULTS).default(10),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ text: query, lat, lng, limit }) => {
      if (await checkRateLimit("mcp", "standard")) {
        return { ...text({ error: "Rate limited" }), isError: true };
      }
      return text(await searchPlacesByText({ text: query, lat, lng, limit }));
    },
  );

  server.registerTool(
    "find_places",
    {
      title: "Find places with filters",
      description:
        "Filtered search for a KIND of place that find_places_nearby's categories cannot express: tag_filters (shop=bakery, shop=butcher, shop=alcohol, real_ale=* for craft/real ale pubs) and/or keywords matched in name/description, optionally narrowed by type codes. Nearest first within radius_km — widen it yourself when results are few. Give at least one of types, tag_filters, keywords. For plain category browsing use find_places_nearby; for a known name use search_places_by_name.",
      inputSchema: z.object({
        lat,
        lng,
        types: z
          .string()
          .max(3)
          .default("")
          .describe("Optional type codes from list_poi_types, e.g. 'r'"),
        tag_filters: z
          .array(z.enum(ALL_TAG_FILTER_IDS))
          .max(4)
          .default([])
          .describe('JSON array of ids, e.g. ["shop=bakery"]'),
        keywords: z
          .array(z.string().min(1).max(40))
          .max(6)
          .default([])
          .describe('JSON array of strings, e.g. ["pizza","ital"]'),
        radius_km: z
          .number()
          .min(0.1)
          .max(MCP_MAX_RADIUS_KM)
          .default(30)
          .describe(
            "Search radius in km. An empty result also returns the nearest matches beyond it.",
          ),
        limit: z.number().int().min(1).max(MCP_MAX_RESULTS).default(10),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ lat, lng, types, tag_filters, keywords, radius_km, limit }) => {
      if (await checkRateLimit("mcp", "standard")) {
        return { ...text({ error: "Rate limited" }), isError: true };
      }
      return text(
        await findPlacesFiltered({
          lat,
          lng,
          types,
          tagFilterIds: tag_filters,
          keywords,
          radiusKm: radius_km,
          limit,
        }),
      );
    },
  );

  server.registerTool(
    "get_route",
    {
      title: "Get route",
      description:
        "Real road/walking/cycling route between coordinates using openmap's routing engine (same as the website): distance_km, duration_min, the main legs (e.g. 'take A1 toward Kaunas') and, for a plain A→B route, url_to_show_user — a link that opens the route on the openmap.lt map. The user cannot see tool output, so you MUST copy that full URL into your reply as plain text on its own line (never just mention the field name) and not comment on its host. Use it for 'how far / how long / how do I get from X to Y'. Get coordinates from find_settlement or a POI id lookup — do not guess them. Straight-line distance is NOT the driving distance. 2-8 points; optimize_order reorders the points after the first by nearest-neighbor (a heuristic).",
      inputSchema: z.object({
        points: z
          .array(
            z.object({
              lat,
              lng,
              name: z
                .string()
                .max(100)
                .optional()
                .describe("Label for the map link"),
            }),
          )
          .min(2)
          .max(8)
          .describe(
            "Route points in visiting order; first = start, last = end",
          ),
        profile: z.enum(["car", "foot", "bike"]).default("car"),
        optimize_order: z.boolean().default(false),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ points, profile, optimize_order }) => {
      if (await checkRateLimit("mcp", "standard")) {
        return { ...text({ error: "Rate limited" }), isError: true };
      }
      return text(
        await getRoute({ points, profile, optimizeOrder: optimize_order }),
      );
    },
  );

  server.registerTool(
    "get_poi",
    {
      title: "Get POI details",
      description:
        'Full details (all tags, opening hours, website, ...) for one POI id returned by the other tools. Offer this to the user as "more about <place name>", never by tool name; if their question already needs opening hours, phone or website, call it without asking.',
      inputSchema: z.object({ id: z.string().regex(/^\d{1,12}$/) }),
      annotations: { readOnlyHint: true },
    },
    async ({ id }) => {
      if (await checkRateLimit("mcp", "standard")) {
        return { ...text({ error: "Rate limited" }), isError: true };
      }
      return text(await getPoiDetails(id));
    },
  );
}

const handler = createMcpHandler(
  (server) => {
    logToolResults(server);
    registerTools(server);
  },
  {
    serverInfo: { name: "openmap-lt", version: "0.1.0" },
    instructions:
      'Data comes from the openmap.lt map of Lithuania. The user cannot see tool results: whenever a result contains a URL meant for the user (url_to_show_user), paste the complete URL into your answer as plain text on its own line, not as a field name, and do not remark on its host. Every place you name in a reply must be a markdown link to its `url` field, e.g. [Špunka](https://openmap.lt/places/123-spunka), so the user can click through to it on the map; never invent or edit these URLs. Use route distances from get_route, not straight-line estimates or memory. The user does not know these tools exist and cannot call them: never mention tool, field or parameter names in your reply. To offer more detail, speak naturally about the place (e.g. "I can show opening hours and contact details for Spunka if you like"), then fetch it yourself when they say yes.',
  },
);

async function POST(request: Request) {
  await logMcpRequest(request);
  return handler(request);
}

export { handler as GET, POST };
