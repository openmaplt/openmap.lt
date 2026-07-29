"use server";

import { MAP_PROFILES } from "@/config/map-profiles";
import { getCurrentUser } from "@/lib/auth";
import type { CommentRow } from "@/lib/comments";
import {
  approveComment,
  deleteOwnComment,
  insertComment,
  rejectComment,
} from "@/lib/comments";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";
import { checkRateLimit, checkUserRateLimit } from "@/lib/rateLimit";

const MAX_BODY_LENGTH = 2000;
const MAX_POI_NAME_LENGTH = 200;
const MAX_OBJECT_REF_LENGTH = 200;

export type CreateCommentResult =
  | { ok: true; comment: CommentRow }
  | {
      ok: false;
      error:
        | "rate_limited"
        | "no_session"
        | "invalid_profile"
        | "invalid_ref"
        | "invalid_body";
    };

export async function createCommentAction(input: {
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
  body: string;
}): Promise<CreateCommentResult> {
  if (await checkRateLimit("commentCreate", "strict")) {
    return { ok: false, error: "rate_limited" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }

  if (checkUserRateLimit("commentCreate", user.id, "strict")) {
    return { ok: false, error: "rate_limited" };
  }

  if (!MAP_PROFILES.some((profile) => profile.id === input.mapProfileId)) {
    return { ok: false, error: "invalid_profile" };
  }

  if (
    input.objectRef.length === 0 ||
    input.objectRef.length > MAX_OBJECT_REF_LENGTH
  ) {
    return { ok: false, error: "invalid_ref" };
  }

  const body = input.body.trim();
  if (body.length === 0 || body.length > MAX_BODY_LENGTH) {
    return { ok: false, error: "invalid_body" };
  }

  const comment = await insertComment({
    userId: user.id,
    mapProfileId: input.mapProfileId,
    objectRef: input.objectRef,
    poiName: input.poiName?.trim().slice(0, MAX_POI_NAME_LENGTH) || null,
    body,
  });

  return { ok: true, comment };
}

export type ModerationActionResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "no_permission"
        | "already_moderated"
        | "no_session"
        | "rate_limited";
    };

async function moderateCommentAction(
  id: number,
  moderate: (id: number, moderatorId: number) => Promise<CommentRow | null>,
): Promise<ModerationActionResult> {
  if (await checkRateLimit("commentModerate", "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }

  if (checkUserRateLimit("commentModerate", user.id, "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  if (!(await currentUserHasPermission(PERMISSIONS.COMMENTS_MODERATE))) {
    return { ok: false, error: "no_permission" };
  }

  const result = await moderate(id, user.id);
  if (!result) {
    return { ok: false, error: "already_moderated" };
  }

  return { ok: true };
}

export async function approveCommentAction(
  id: number,
): Promise<ModerationActionResult> {
  return moderateCommentAction(id, approveComment);
}

export async function rejectCommentAction(
  id: number,
): Promise<ModerationActionResult> {
  return moderateCommentAction(id, rejectComment);
}

export type DeleteCommentResult =
  | { ok: true }
  | { ok: false; error: "not_found" | "no_session" | "rate_limited" };

export async function deleteOwnCommentAction(
  id: number,
): Promise<DeleteCommentResult> {
  if (await checkRateLimit("commentDelete", "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }

  if (checkUserRateLimit("commentDelete", user.id, "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const deleted = await deleteOwnComment(id, user.id);
  if (!deleted) {
    return { ok: false, error: "not_found" };
  }

  return { ok: true };
}
