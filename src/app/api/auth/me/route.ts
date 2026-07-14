import { NextResponse } from "next/server";
import { getLinkedProviders } from "@/lib/accountLinking";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null, linkedProviders: [] });
  }

  const linkedProviders = await getLinkedProviders(user.id);
  return NextResponse.json({ user, linkedProviders });
}
