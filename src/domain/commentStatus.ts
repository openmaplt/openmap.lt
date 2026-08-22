// Mirrors the Postgres enum openmap.comment_status (sql/comments.sql) — a
// fixed set that can't change without a DB migration, unlike a config
// catalog. Shared by server (src/lib/comments.ts) and client
// (src/components/comments/*.tsx) code, so this file must stay free of
// "server-only".
export const COMMENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type CommentStatus =
  (typeof COMMENT_STATUS)[keyof typeof COMMENT_STATUS];

// The two terminal states a moderator can set a comment to — "pending" is
// only ever the pre-moderation default, never a moderation target.
export type ModeratedCommentStatus =
  | typeof COMMENT_STATUS.APPROVED
  | typeof COMMENT_STATUS.REJECTED;
