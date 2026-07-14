import type { NextRequest } from "next/server";
import { buildAuthorizeUrl } from "@/lib/oauth/osm";
import { startOAuthFlow } from "@/lib/oauth/routeHelpers";

export async function GET(request: NextRequest) {
  return startOAuthFlow(request, buildAuthorizeUrl);
}
