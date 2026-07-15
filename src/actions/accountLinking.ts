"use server";

import { unlinkProvider } from "@/lib/accountLinking";
import { getCurrentUser } from "@/lib/auth";
import { isProvider, type Provider } from "@/lib/oauth/providers";
import { checkRateLimit } from "@/lib/rateLimit";

export type UnlinkActionResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "last_remaining_method"
        | "no_session"
        | "invalid_provider"
        | "rate_limited";
    };

export async function unlinkAction(
  provider: Provider,
): Promise<UnlinkActionResult> {
  if (await checkRateLimit("authUnlink")) {
    return { ok: false, error: "rate_limited" };
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { ok: false, error: "no_session" };
  }

  if (!isProvider(provider)) {
    return { ok: false, error: "invalid_provider" };
  }

  return unlinkProvider(currentUser.id, provider);
}
