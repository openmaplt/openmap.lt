// Mirrors the Postgres enum openmap.profile_moderation_status
// (sql/user_profiles.sql) — a fixed set that can't change without a DB
// migration. Every user-created profile is public by default; an admin can hide
// one with a comment, and its author can ask for another look after fixing it.
// Must stay free of "server-only" (used by server and client code).
export const PROFILE_MODERATION = {
  // Open to everyone who knows the address.
  VISIBLE: "visible",
  // Hidden by an admin (with a comment): only its author and moderators can
  // open it, and it is not in the profile switcher.
  HIDDEN: "hidden",
  // The author says it is fixed and asks an admin to look again. Still hidden.
  REVIEW_REQUESTED: "review_requested",
} as const;

export type ProfileModeration =
  (typeof PROFILE_MODERATION)[keyof typeof PROFILE_MODERATION];
