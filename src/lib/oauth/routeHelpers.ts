import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { BASE_URL } from "@/config/config";
import { resolveLink } from "@/lib/accountLinking";
import {
  createSession,
  getCurrentUser,
  type ProviderProfile,
  resolveLogin,
} from "@/lib/auth";
import type { Provider } from "@/lib/oauth/providers";
import { OAUTH_STATE_COOKIE_NAME, verifyOAuthState } from "@/lib/oauth/state";

function withQueryParam(path: string, key: string, value: string): string {
  const [pathname, search] = path.split("?");
  const params = new URLSearchParams(search);
  params.set(key, value);
  return `${pathname}?${params.toString()}`;
}

function redirectWithClearedState(url: string) {
  const target = new URL(url, BASE_URL);
  const response = NextResponse.redirect(target);
  response.cookies.delete(OAUTH_STATE_COOKIE_NAME);
  return response;
}

export async function handleOAuthCallback(
  request: NextRequest,
  provider: Provider,
  exchangeCodeForToken: (code: string) => Promise<string>,
  fetchProfile: (accessToken: string) => Promise<ProviderProfile>,
): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const queryState = request.nextUrl.searchParams.get("state");
  const verified = verifyOAuthState(
    request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value,
    queryState,
  );

  if (!code || !verified) {
    return redirectWithClearedState("/?login_error=1");
  }

  const accessToken = await exchangeCodeForToken(code);
  const profile = await fetchProfile(accessToken);

  if (verified.intent === "link") {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return redirectWithClearedState("/?link_error=no_session");
    }

    const result = await resolveLink(provider, profile, currentUser.id);
    if (!result.ok) {
      return redirectWithClearedState(`/?link_error=${result.error}`);
    }
    return redirectWithClearedState(
      withQueryParam(verified.returnTo, "link_success", "1"),
    );
  }

  const { userId } = await resolveLogin(provider, profile);
  await createSession(userId);
  return redirectWithClearedState(
    withQueryParam(verified.returnTo, "login_success", "1"),
  );
}
