import "server-only";

import { randomBytes } from "node:crypto";

export const OAUTH_STATE_COOKIE_NAME = "om_oauth_state";

export type OAuthIntent = "login" | "link";

type StateCookiePayload = {
  state: string;
  intent: OAuthIntent;
  returnTo: string;
};

// A single leading slash not followed by another slash/backslash — rejects
// protocol-relative ("//evil.com") and backslash ("/\evil.com") redirects,
// both of which browsers can resolve as absolute URLs to a different origin.
export function isSafeRelativePath(value: string): boolean {
  return /^\/(?!\/|\\)/.test(value);
}

export function createOAuthState(
  intent: OAuthIntent,
  returnTo: string,
): { state: string; cookieValue: string } {
  const state = randomBytes(16).toString("hex");
  const safeReturnTo = isSafeRelativePath(returnTo) ? returnTo : "/";
  return { state, cookieValue: `${state}:${intent}:${safeReturnTo}` };
}

export function verifyOAuthState(
  cookieValue: string | undefined,
  queryState: string | null,
): StateCookiePayload | null {
  if (!cookieValue || !queryState) return null;

  const [state, intent, ...rest] = cookieValue.split(":");
  if (state !== queryState || (intent !== "login" && intent !== "link")) {
    return null;
  }

  const returnTo = rest.join(":");
  return {
    state,
    intent,
    returnTo: isSafeRelativePath(returnTo) ? returnTo : "/",
  };
}
