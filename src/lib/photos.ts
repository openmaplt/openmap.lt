import "server-only";

import { cache } from "react";
import type { PhotoLicense } from "@/config/photoLicenses";
import { query, queryOne, queryOneOrThrow } from "@/lib/db";

export const PHOTO_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type PhotoStatus = (typeof PHOTO_STATUS)[keyof typeof PHOTO_STATUS];

export type PhotoRow = {
  id: number;
  userId: number;
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
  fileName: string;
  width: number;
  height: number;
  license: PhotoLicense;
  showAuthor: boolean;
  status: PhotoStatus;
  createdAt: Date;
  moderatedAt: Date | null;
  moderatedBy: number | null;
  rejectionReason: string | null;
};

type PhotoDbRow = {
  id: number;
  user_id: number;
  map_profile_id: string;
  object_ref: string;
  poi_name: string | null;
  file_name: string;
  width: number;
  height: number;
  license: PhotoLicense;
  show_author: boolean;
  status: PhotoStatus;
  created_at: Date;
  moderated_at: Date | null;
  moderated_by: number | null;
  rejection_reason: string | null;
};

function toPhotoRow(row: PhotoDbRow): PhotoRow {
  return {
    id: row.id,
    userId: row.user_id,
    mapProfileId: row.map_profile_id,
    objectRef: row.object_ref,
    poiName: row.poi_name,
    fileName: row.file_name,
    width: row.width,
    height: row.height,
    license: row.license,
    showAuthor: row.show_author,
    status: row.status,
    createdAt: row.created_at,
    moderatedAt: row.moderated_at,
    moderatedBy: row.moderated_by,
    rejectionReason: row.rejection_reason,
  };
}

export type PendingPhoto = PhotoRow & {
  author: { username: string | null; name: string | null };
};

// Wrapped in cache() for the same per-request dedup reason as
// listPendingComments (sidebar badge + moderation page both call this).
export const listPendingPhotos = cache(async function listPendingPhotos(
  limit = 100,
): Promise<PendingPhoto[]> {
  const result = await query(
    `select p.*, u.username as author_username, u.name as author_name
     from openmap.poi_photos p
     join openmap.users u on u.id = p.user_id
     where p.status = $1
     order by p.created_at asc
     limit $2`,
    [PHOTO_STATUS.PENDING, limit],
  );
  return result.rows.map((row) => ({
    ...toPhotoRow(row),
    author: { username: row.author_username, name: row.author_name },
  }));
});

export const countPendingPhotos = cache(
  async function countPendingPhotos(): Promise<number> {
    const row = await queryOneOrThrow<{ count: number }>(
      `select count(*)::int as count from openmap.poi_photos where status = $1`,
      [PHOTO_STATUS.PENDING],
    );
    return row.count;
  },
);

// Just the fields the moderation-digest email needs (src/lib/moderationDigest.ts)
// — no author join, and no cache() since this runs from a scheduled timer,
// outside any request context.
export async function listPendingPhotoSummaries(): Promise<
  { poiName: string | null; objectRef: string; mapProfileId: string }[]
> {
  const result = await query(
    `select poi_name, object_ref, map_profile_id
     from openmap.poi_photos
     where status = $1
     order by created_at`,
    [PHOTO_STATUS.PENDING],
  );
  return result.rows.map((row) => ({
    poiName: row.poi_name,
    objectRef: row.object_ref,
    mapProfileId: row.map_profile_id,
  }));
}

type ModeratedStatus =
  | typeof PHOTO_STATUS.APPROVED
  | typeof PHOTO_STATUS.REJECTED;

async function moderatePhoto(
  id: number,
  moderatorId: number,
  status: ModeratedStatus,
  reason: string | null = null,
): Promise<PhotoRow | null> {
  const row = await queryOne<PhotoDbRow>(
    `update openmap.poi_photos
     set status = $2, moderated_at = now(), moderated_by = $3, rejection_reason = $5
     where id = $1 and status = $4
     returning *`,
    [id, status, moderatorId, PHOTO_STATUS.PENDING, reason],
  );
  return row ? toPhotoRow(row) : null;
}

export async function approvePhoto(
  id: number,
  moderatorId: number,
): Promise<PhotoRow | null> {
  return moderatePhoto(id, moderatorId, PHOTO_STATUS.APPROVED);
}

export async function rejectPhoto(
  id: number,
  moderatorId: number,
  reason: string | null = null,
): Promise<PhotoRow | null> {
  return moderatePhoto(id, moderatorId, PHOTO_STATUS.REJECTED, reason);
}

export type PoiPhotoView = {
  id: number;
  fileName: string;
  width: number;
  height: number;
  license: PhotoLicense;
  createdAt: Date;
  // null when the uploader opted out of showing their name for this photo.
  author: { username: string | null; name: string | null } | null;
};

function toPoiPhotoView(row: {
  id: number;
  file_name: string;
  width: number;
  height: number;
  license: PhotoLicense;
  created_at: Date;
  show_author: boolean;
  author_username: string | null;
  author_name: string | null;
}): PoiPhotoView {
  return {
    id: row.id,
    fileName: row.file_name,
    width: row.width,
    height: row.height,
    license: row.license,
    createdAt: row.created_at,
    author: row.show_author
      ? { username: row.author_username, name: row.author_name }
      : null,
  };
}

export async function listApprovedPhotos(
  mapProfileId: string,
  objectRef: string,
): Promise<PoiPhotoView[]> {
  const result = await query(
    `select p.id, p.file_name, p.width, p.height, p.license, p.created_at, p.show_author,
            u.username as author_username, u.name as author_name
     from openmap.poi_photos p
     join openmap.users u on u.id = p.user_id
     where p.map_profile_id = $1 and p.object_ref = $2 and p.status = $3
     order by p.created_at asc`,
    [mapProfileId, objectRef, PHOTO_STATUS.APPROVED],
  );
  return result.rows.map(toPoiPhotoView);
}

// Same shape as listApprovedPhotos — used to show a moderator the pending
// photos for the object+profile they're currently looking at, inline with the
// already-approved ones, mirroring listPendingCommentsForObject.
export async function listPendingPhotosForObject(
  mapProfileId: string,
  objectRef: string,
): Promise<PoiPhotoView[]> {
  const result = await query(
    `select p.id, p.file_name, p.width, p.height, p.license, p.created_at, p.show_author,
            u.username as author_username, u.name as author_name
     from openmap.poi_photos p
     join openmap.users u on u.id = p.user_id
     where p.map_profile_id = $1 and p.object_ref = $2 and p.status = $3
     order by p.created_at asc`,
    [mapProfileId, objectRef, PHOTO_STATUS.PENDING],
  );
  return result.rows.map(toPoiPhotoView);
}

export async function listOwnPhotos(userId: number): Promise<PhotoRow[]> {
  const result = await query(
    `select * from openmap.poi_photos where user_id = $1 order by created_at desc`,
    [userId],
  );
  return result.rows.map(toPhotoRow);
}

// Unlike the license (fixed at upload time — changing it retroactively has
// legal implications for a photo already published under it), show_author is
// just a display preference the uploader can flip anytime, on any status,
// without re-moderation.
export async function updateOwnPhotoShowAuthor(
  id: number,
  userId: number,
  showAuthor: boolean,
): Promise<boolean> {
  const row = await queryOne<{ id: number }>(
    `update openmap.poi_photos set show_author = $3 where id = $1 and user_id = $2 returning id`,
    [id, userId, showAuthor],
  );
  return row !== null;
}

// Returns the deleted row's file_name (so the caller can remove it from disk)
// or null if nothing matched (not found / not owned by this user).
export async function deleteOwnPhoto(
  id: number,
  userId: number,
): Promise<string | null> {
  const row = await queryOne<{ file_name: string }>(
    `delete from openmap.poi_photos where id = $1 and user_id = $2 returning file_name`,
    [id, userId],
  );
  return row?.file_name ?? null;
}

export async function insertPhoto(params: {
  userId: number;
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
  fileName: string;
  width: number;
  height: number;
  license: PhotoLicense;
  showAuthor: boolean;
  // Set when the uploader holds photos.moderate — their own photos skip the
  // pending queue and are self-approved on insert, mirroring insertComment.
  autoApprove?: boolean;
}): Promise<PhotoRow> {
  const status = params.autoApprove
    ? PHOTO_STATUS.APPROVED
    : PHOTO_STATUS.PENDING;
  const moderatedBy = params.autoApprove ? params.userId : null;
  const row = await queryOneOrThrow<PhotoDbRow>(
    `insert into openmap.poi_photos
       (user_id, map_profile_id, object_ref, poi_name, file_name, width, height, license, show_author, status, moderated_at, moderated_by)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, case when $11::int is null then null else now() end, $11)
     returning *`,
    [
      params.userId,
      params.mapProfileId,
      params.objectRef,
      params.poiName,
      params.fileName,
      params.width,
      params.height,
      params.license,
      params.showAuthor,
      status,
      moderatedBy,
    ],
  );
  return toPhotoRow(row);
}
