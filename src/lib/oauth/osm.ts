import "server-only";

import { BASE_URL } from "@/config/config";
import type { ProviderProfile } from "@/lib/auth";

const OSM_AUTHORIZE_URL = "https://www.openstreetmap.org/oauth2/authorize";
const OSM_TOKEN_URL = "https://www.openstreetmap.org/oauth2/token";
const OSM_PROFILE_URL =
  "https://api.openstreetmap.org/api/0.6/user/details.json";

function redirectUri(): string {
  return `${BASE_URL}/api/auth/osm/callback`;
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.OSM_CLIENT_ID ?? "",
    redirect_uri: redirectUri(),
    response_type: "code",
    scope: "read_prefs",
    state,
  });
  return `${OSM_AUTHORIZE_URL}?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch(OSM_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
      client_id: process.env.OSM_CLIENT_ID ?? "",
      client_secret: process.env.OSM_CLIENT_SECRET ?? "",
    }),
  });
  if (!res.ok) {
    throw new Error(`OSM token mainas nepavyko: ${res.status}`);
  }
  const data = await res.json();
  return data.access_token as string;
}

export async function fetchOsmProfile(
  accessToken: string,
): Promise<ProviderProfile> {
  const res = await fetch(OSM_PROFILE_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`OSM profilio gavimas nepavyko: ${res.status}`);
  }
  const { user } = await res.json();

  return {
    providerUserId: String(user.id),
    username: user.display_name ?? null,
    name: null,
    email: null,
    avatarUrl: user.img?.href ?? null,
  };
}
