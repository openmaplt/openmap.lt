import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST() {
  if (await checkRateLimit("authLogout")) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  await destroySession();
  return NextResponse.json({ ok: true });
}
