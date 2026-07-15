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
import {
  createOAuthState,
  OAUTH_STATE_COOKIE_NAME,
  type OAuthIntent,
  verifyOAuthState,
} from "@/lib/oauth/state";

export function startOAuthFlow(
  request: NextRequest,
  buildAuthorizeUrl: (state: string) => string,
): NextResponse {
  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/";
  const intent: OAuthIntent =
    request.nextUrl.searchParams.get("intent") === "link" ? "link" : "login";
  const { state, cookieValue } = createOAuthState(intent, returnTo);

  const response = NextResponse.redirect(buildAuthorizeUrl(state));
  response.cookies.set(OAUTH_STATE_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}

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
