import { type NextRequest, NextResponse } from "next/server";
import { unlinkProvider } from "@/lib/accountLinking";
import { getCurrentUser } from "@/lib/auth";
import { isProvider } from "@/lib/oauth/providers";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  if (await checkRateLimit("authUnlink")) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json(
      { ok: false, error: "no_session" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const { provider } = body;
  if (!isProvider(provider)) {
    return NextResponse.json(
      { ok: false, error: "invalid_provider" },
      { status: 400 },
    );
  }

  const result = await unlinkProvider(currentUser.id, provider);
  if (!result.ok) {
    return NextResponse.json(result, { status: 409 });
  }
  return NextResponse.json(result);
}
