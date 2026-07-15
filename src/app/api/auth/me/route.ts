import { NextResponse } from "next/server";
import { getLinkedProviders } from "@/lib/accountLinking";
import { getCurrentUser } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET() {
  if (await checkRateLimit("authMe")) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null, linkedProviders: [] });
  }

  const linkedProviders = await getLinkedProviders(user.id);
  return NextResponse.json({ user, linkedProviders });
}
