import type { NextRequest } from "next/server";
import { exchangeCodeForToken, fetchGoogleProfile } from "@/lib/oauth/google";
import { PROVIDERS } from "@/lib/oauth/providers";
import { handleOAuthCallback } from "@/lib/oauth/routeHelpers";

export async function GET(request: NextRequest) {
  return handleOAuthCallback(
    request,
    PROVIDERS.GOOGLE,
    exchangeCodeForToken,
    fetchGoogleProfile,
  );
}
