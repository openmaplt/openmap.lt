import type { NextRequest } from "next/server";
import { buildAuthorizeUrl } from "@/lib/oauth/google";
import { startOAuthFlow } from "@/lib/oauth/routeHelpers";

export async function GET(request: NextRequest) {
  return startOAuthFlow(request, buildAuthorizeUrl);
}
