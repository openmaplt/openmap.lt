import { BASE_URL } from "@/config/config";
import type { ProviderProfile } from "@/lib/auth";

const GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

function redirectUri(): string {
  return `${BASE_URL}/api/auth/google/callback`;
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
  });
  return `${GOOGLE_AUTHORIZE_URL}?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token mainas nepavyko: ${res.status}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function fetchGoogleProfile(
  accessToken: string,
): Promise<ProviderProfile> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Google profilio gavimas nepavyko: ${res.status}`);
  }
  const profile = await res.json();

  return {
    providerUserId: profile.sub as string,
    username: null,
    name: profile.name ?? null,
    email: profile.email ?? null,
    avatarUrl: profile.picture ?? null,
  };
}
