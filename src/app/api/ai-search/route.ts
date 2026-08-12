import type { UIMessage } from "ai";
import { searchPlacesForAi } from "@/data/aiSearch";
import {
  classifySearchQuery,
  streamSearchResponse,
  toPoiSummaries,
} from "@/lib/aiSearchClient";
import { type AiSearchPlan, sanitizePlan } from "@/lib/aiSearchSchema";
import { getCurrentUser } from "@/lib/auth";
import { checkUserRateLimit } from "@/lib/rateLimit";
import { getUserRole, ROLES } from "@/lib/users";

// Route Handler, not a server action — the response must stream
// token-by-token, which Next.js server actions can't do (see AGENTS.md).
// Auth/rate-limit checks below are the real security boundary, independent
// of whether the client shows the trigger button.
//
// Orchestration only: parse/validate the request, delegate to
// src/lib/aiSearchClient.ts (LLM calls, returns a ready Response) and
// src/data/aiSearch.ts (DB) — no AI SDK or SQL details here.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });
  if ((await getUserRole(user.id)) !== ROLES.ADMIN) {
    return new Response(null, { status: 403 });
  }

  if (checkUserRateLimit("aiSearch", user.id, "aiSearch")) {
    return new Response(null, { status: 429 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return new Response("AI paieška nesukonfigūruota.", { status: 503 });
  }

  const body = await request.json();
  const messages = body.messages as UIMessage[];
  const bbox = body.bbox as unknown;
  const pos = body.pos as unknown;

  if (
    !Array.isArray(bbox) ||
    bbox.length !== 4 ||
    bbox.some((n) => typeof n !== "number" || !Number.isFinite(n)) ||
    !Array.isArray(pos) ||
    pos.length !== 2 ||
    pos.some((n) => typeof n !== "number" || !Number.isFinite(n)) ||
    !Array.isArray(messages)
  ) {
    return new Response(null, { status: 400 });
  }

  let plan: AiSearchPlan;
  try {
    plan = await classifySearchQuery(messages);
  } catch (error) {
    console.error("AI search — classifySearchQuery error:", error);
    return new Response(
      "AI paieška laikinai nepasiekiama, pabandykite vėliau.",
      { status: 502 },
    );
  }

  const groups = sanitizePlan(plan);
  const dbResult = await searchPlacesForAi(
    groups,
    bbox,
    pos as [number, number],
  );
  const poiList = toPoiSummaries(dbResult.features);

  return streamSearchResponse(messages, poiList);
}
