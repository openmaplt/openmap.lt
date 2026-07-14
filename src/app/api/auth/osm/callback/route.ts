import type { NextRequest } from "next/server";
import { exchangeCodeForToken, fetchOsmProfile } from "@/lib/oauth/osm";
import { PROVIDERS } from "@/lib/oauth/providers";
import { handleOAuthCallback } from "@/lib/oauth/routeHelpers";

export async function GET(request: NextRequest) {
  return handleOAuthCallback(
    request,
    PROVIDERS.OSM,
    exchangeCodeForToken,
    fetchOsmProfile,
  );
}
