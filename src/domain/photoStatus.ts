// Mirrors the Postgres enum backing openmap.poi_photos.status
// (sql/photos.sql) — a fixed set that can't change without a DB migration,
// unlike a config catalog. Shared by server (src/lib/photos.ts) and client
// (src/components/gallery/*.tsx) code, so this file must stay free of
// "server-only".
export const PHOTO_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type PhotoStatus = (typeof PHOTO_STATUS)[keyof typeof PHOTO_STATUS];

// The two terminal states a moderator can set a photo to — "pending" is
// only ever the pre-moderation default, never a moderation target.
export type ModeratedPhotoStatus =
  | typeof PHOTO_STATUS.APPROVED
  | typeof PHOTO_STATUS.REJECTED;
