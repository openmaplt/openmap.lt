// Limits and defaults for user-created map profiles (src/lib/userProfiles.ts).
// Plain data, no "server-only".

// Max profiles a single user can own.
export const MAX_PROFILES_PER_USER = 5;

// Max size of a saved style JSON (bytes). The biggest built-in style is ~60 KB.
export const MAX_STYLE_BYTES = 1_000_000;

// Style every new profile starts from (file in public/styles/).
export const PROFILE_TEMPLATE_STYLE_FILE = "topo.json";

// How long an editor token (src/lib/profileEditToken.ts) stays valid.
export const EDIT_TOKEN_TTL_SECONDS = 2 * 60 * 60;

// Origin of the Maputnik fork that edits profile styles. It is the only
// cross-origin caller allowed by the profile-styles API (CORS).
export const PROFILE_EDITOR_ORIGIN =
  process.env.PROFILE_EDITOR_ORIGIN ?? "https://editor.openmap.lt";

// A saved style may only load data from these hosts (exact or subdomain).
// This matches the app's CSP `connect-src` and keeps third parties from
// receiving the IP of everyone who views a shared map.
export const ALLOWED_STYLE_HOSTS = ["openmap.lt"] as const;

export const PROFILE_NAME_MAX_LENGTH = 80;
