// Mirrors the Postgres enum openmap.profile_base_status
// (sql/user_profiles.sql) — a fixed set that can't change without a DB
// migration. Tracks whether a public profile was promoted to a "base" profile
// that every visitor sees in the profile switcher. Must stay free of
// "server-only" (used by server and client code).
export const PROFILE_BASE_STATUS = {
  NONE: "none",
  // The owner asked for the profile to become a base profile.
  REQUESTED: "requested",
  // An admin approved it.
  APPROVED: "approved",
} as const;

export type ProfileBaseStatus =
  (typeof PROFILE_BASE_STATUS)[keyof typeof PROFILE_BASE_STATUS];
