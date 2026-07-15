"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLinkedProviders, type LinkedAccount } from "@/lib/accountLinking";
import { destroySession, getCurrentUser, type PublicUser } from "@/lib/auth";
import { buildAuthorizeUrl as buildGoogleAuthorizeUrl } from "@/lib/oauth/google";
import { buildAuthorizeUrl as buildOsmAuthorizeUrl } from "@/lib/oauth/osm";
import { isProvider, PROVIDERS, type Provider } from "@/lib/oauth/providers";
import {
  createOAuthState,
  OAUTH_STATE_COOKIE_NAME,
  type OAuthIntent,
} from "@/lib/oauth/state";
import { checkRateLimit } from "@/lib/rateLimit";

export type MeResult = {
  user: PublicUser | null;
  linkedProviders: LinkedAccount[];
};

export async function getMe(): Promise<MeResult> {
  if (await checkRateLimit("authMe")) {
    return { user: null, linkedProviders: [] };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { user: null, linkedProviders: [] };
  }

  const linkedProviders = await getLinkedProviders(user.id);
  return { user, linkedProviders };
}

export async function logoutAction(): Promise<void> {
  if (await checkRateLimit("authLogout")) {
    return;
  }

  await destroySession();
}

export type StartLoginResult = {
  ok: false;
  error: "rate_limited" | "invalid_provider" | "invalid_intent";
};

export async function startLoginAction(
  provider: Provider,
  intent: OAuthIntent,
  returnTo: string,
): Promise<StartLoginResult> {
  if (await checkRateLimit("authLogin")) {
    return { ok: false, error: "rate_limited" };
  }

  if (!isProvider(provider)) {
    return { ok: false, error: "invalid_provider" };
  }

  if (intent !== "login" && intent !== "link") {
    return { ok: false, error: "invalid_intent" };
  }

  const { state, cookieValue } = createOAuthState(intent, returnTo);
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const authorizeUrl =
    provider === PROVIDERS.GOOGLE
      ? buildGoogleAuthorizeUrl(state)
      : buildOsmAuthorizeUrl(state);

  redirect(authorizeUrl);
}
