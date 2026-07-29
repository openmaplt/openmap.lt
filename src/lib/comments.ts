import "server-only";

import { query, queryOne, queryOneOrThrow } from "@/lib/db";

export const COMMENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type CommentStatus =
  (typeof COMMENT_STATUS)[keyof typeof COMMENT_STATUS];

export type CommentRow = {
  id: number;
  userId: number;
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
  body: string;
  status: CommentStatus;
  createdAt: Date;
  moderatedAt: Date | null;
  moderatedBy: number | null;
};

type CommentDbRow = {
  id: number;
  user_id: number;
  map_profile_id: string;
  object_ref: string;
  poi_name: string | null;
  body: string;
  status: CommentStatus;
  created_at: Date;
  moderated_at: Date | null;
  moderated_by: number | null;
};

function toCommentRow(row: CommentDbRow): CommentRow {
  return {
    id: row.id,
    userId: row.user_id,
    mapProfileId: row.map_profile_id,
    objectRef: row.object_ref,
    poiName: row.poi_name,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
    moderatedAt: row.moderated_at,
    moderatedBy: row.moderated_by,
  };
}

export type PendingComment = CommentRow & {
  author: { username: string | null; name: string | null };
};

export async function listPendingComments(
  limit = 100,
): Promise<PendingComment[]> {
  const result = await query(
    `select c.*, u.username as author_username, u.name as author_name
     from openmap.poi_comments c
     join openmap.users u on u.id = c.user_id
     where c.status = $1
     order by c.created_at asc
     limit $2`,
    [COMMENT_STATUS.PENDING, limit],
  );
  return result.rows.map((row) => ({
    ...toCommentRow(row),
    author: { username: row.author_username, name: row.author_name },
  }));
}

type ModeratedStatus =
  | typeof COMMENT_STATUS.APPROVED
  | typeof COMMENT_STATUS.REJECTED;

async function moderateComment(
  id: number,
  moderatorId: number,
  status: ModeratedStatus,
): Promise<CommentRow | null> {
  const row = await queryOne<CommentDbRow>(
    `update openmap.poi_comments
     set status = $2, moderated_at = now(), moderated_by = $3
     where id = $1 and status = $4
     returning *`,
    [id, status, moderatorId, COMMENT_STATUS.PENDING],
  );
  return row ? toCommentRow(row) : null;
}

export async function approveComment(
  id: number,
  moderatorId: number,
): Promise<CommentRow | null> {
  return moderateComment(id, moderatorId, COMMENT_STATUS.APPROVED);
}

export async function rejectComment(
  id: number,
  moderatorId: number,
): Promise<CommentRow | null> {
  return moderateComment(id, moderatorId, COMMENT_STATUS.REJECTED);
}

export type ApprovedComment = {
  id: number;
  body: string;
  createdAt: Date;
  author: {
    username: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
};

export async function listApprovedComments(
  mapProfileId: string,
  objectRef: string,
): Promise<ApprovedComment[]> {
  const result = await query(
    `select c.id, c.body, c.created_at,
            u.username as author_username, u.name as author_name, u.avatar_url as author_avatar_url
     from openmap.poi_comments c
     join openmap.users u on u.id = c.user_id
     where c.map_profile_id = $1 and c.object_ref = $2 and c.status = $3
     order by c.created_at asc`,
    [mapProfileId, objectRef, COMMENT_STATUS.APPROVED],
  );
  return result.rows.map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    author: {
      username: row.author_username,
      name: row.author_name,
      avatarUrl: row.author_avatar_url,
    },
  }));
}

export async function listOwnComments(userId: number): Promise<CommentRow[]> {
  const result = await query(
    `select * from openmap.poi_comments where user_id = $1 order by created_at desc`,
    [userId],
  );
  return result.rows.map(toCommentRow);
}

export async function deleteOwnComment(
  id: number,
  userId: number,
): Promise<boolean> {
  const result = await query(
    `delete from openmap.poi_comments where id = $1 and user_id = $2`,
    [id, userId],
  );
  return result.rowCount !== null && result.rowCount > 0;
}

export async function insertComment(params: {
  userId: number;
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
  body: string;
}): Promise<CommentRow> {
  const row = await queryOneOrThrow<CommentDbRow>(
    `insert into openmap.poi_comments (user_id, map_profile_id, object_ref, poi_name, body)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [
      params.userId,
      params.mapProfileId,
      params.objectRef,
      params.poiName,
      params.body,
    ],
  );
  return toCommentRow(row);
}
