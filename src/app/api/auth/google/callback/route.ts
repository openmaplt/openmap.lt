import { type NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, fetchGoogleProfile } from "@/lib/oauth/google";
import { PROVIDERS } from "@/lib/oauth/providers";
import { handleOAuthCallback } from "@/lib/oauth/routeHelpers";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  if (await checkRateLimit("authCallback")) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  return handleOAuthCallback(
    request,
    PROVIDERS.GOOGLE,
    exchangeCodeForToken,
    fetchGoogleProfile,
  );
}
