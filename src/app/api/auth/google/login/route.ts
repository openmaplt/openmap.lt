import { type NextRequest, NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/oauth/google";
import { startOAuthFlow } from "@/lib/oauth/routeHelpers";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  if (await checkRateLimit("authLogin")) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  return startOAuthFlow(request, buildAuthorizeUrl);
}
