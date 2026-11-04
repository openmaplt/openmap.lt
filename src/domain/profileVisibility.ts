// Mirrors the Postgres enum openmap.profile_visibility (sql/user_profiles.sql)
// — a fixed set that can't change without a DB migration, unlike a config
// catalog. Shared by server (src/lib/userProfiles.ts) and client
// (src/components/dashboard/*) code, so this file must stay free of
// "server-only".
export const PROFILE_VISIBILITY = {
  // Only the owner can open the profile.
  PRIVATE: "private",
  // Anyone holding the secret `?k=` share key can open it.
  LINK: "link",
  // Anyone who knows the slug can open it.
  PUBLIC: "public",
} as const;

export type ProfileVisibility =
  (typeof PROFILE_VISIBILITY)[keyof typeof PROFILE_VISIBILITY];

export const PROFILE_VISIBILITY_VALUES = Object.values(PROFILE_VISIBILITY);
