"use server";

import { MAP_PROFILES } from "@/config/map-profiles";
import { PHOTO_LICENSES, type PhotoLicense } from "@/config/photoLicenses";
import type { PhotoStatus } from "@/domain/photoStatus";
import { getCurrentUser } from "@/lib/auth";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";
import {
  deletePhotoFile,
  processAndSaveImage,
  UnsupportedImageError,
} from "@/lib/photoStorage";
import {
  approvePhoto,
  deleteOwnPhoto,
  insertPhoto,
  type PhotoRow,
  rejectPhoto,
  updateOwnPhotoShowAuthor,
} from "@/lib/photos";
import { checkRateLimit, checkUserRateLimit } from "@/lib/rateLimit";

const MAX_POI_NAME_LENGTH = 200;
const MAX_OBJECT_REF_LENGTH = 200;
const MAX_REJECTION_REASON_LENGTH = 500;
const MAX_FILES_PER_UPLOAD = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const VALID_LICENSES = new Set<string>(Object.values(PHOTO_LICENSES));

export type UploadedPhoto = {
  id: number;
  fileName: string;
  width: number;
  height: number;
  wasResized: boolean;
  status: PhotoStatus;
};

export type CreatePhotoResult =
  | { ok: true; uploaded: UploadedPhoto[]; failedFormatCount: number }
  | {
      ok: false;
      error:
        | "rate_limited"
        | "no_session"
        | "invalid_profile"
        | "invalid_ref"
        | "invalid_license"
        | "no_files"
        | "too_many_files"
        | "file_too_large";
    };

export async function createPhotoAction(
  formData: FormData,
): Promise<CreatePhotoResult> {
  if (await checkRateLimit("photoUpload", "strict")) {
    return { ok: false, error: "rate_limited" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }

  if (checkUserRateLimit("photoUpload", user.id, "strict")) {
    return { ok: false, error: "rate_limited" };
  }

  const mapProfileId = String(formData.get("mapProfileId") ?? "");
  if (!MAP_PROFILES.some((profile) => profile.id === mapProfileId)) {
    return { ok: false, error: "invalid_profile" };
  }

  const objectRef = String(formData.get("objectRef") ?? "");
  if (objectRef.length === 0 || objectRef.length > MAX_OBJECT_REF_LENGTH) {
    return { ok: false, error: "invalid_ref" };
  }

  const license = String(formData.get("license") ?? "");
  if (!VALID_LICENSES.has(license)) {
    return { ok: false, error: "invalid_license" };
  }

  const showAuthor = formData.get("showAuthor") === "true";
  const poiNameRaw = formData.get("poiName");
  const poiName =
    typeof poiNameRaw === "string"
      ? poiNameRaw.trim().slice(0, MAX_POI_NAME_LENGTH) || null
      : null;

  const files = formData
    .getAll("files")
    .filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return { ok: false, error: "no_files" };
  }
  if (files.length > MAX_FILES_PER_UPLOAD) {
    return { ok: false, error: "too_many_files" };
  }
  if (files.some((file) => file.size > MAX_FILE_SIZE_BYTES)) {
    return { ok: false, error: "file_too_large" };
  }

  const autoApprove = await currentUserHasPermission(
    PERMISSIONS.PHOTOS_MODERATE,
  );

  const uploaded: UploadedPhoto[] = [];
  let failedFormatCount = 0;

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    try {
      const processed = await processAndSaveImage(buffer);
      const photo: PhotoRow = await insertPhoto({
        userId: user.id,
        mapProfileId,
        objectRef,
        poiName,
        fileName: processed.fileName,
        width: processed.width,
        height: processed.height,
        license: license as PhotoLicense,
        showAuthor,
        autoApprove,
      });
      uploaded.push({
        id: photo.id,
        fileName: photo.fileName,
        width: photo.width,
        height: photo.height,
        wasResized: processed.wasResized,
        status: photo.status,
      });
    } catch (error) {
      if (error instanceof UnsupportedImageError) {
        failedFormatCount += 1;
        continue;
      }
      throw error;
    }
  }

  return { ok: true, uploaded, failedFormatCount };
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

async function moderatePhotoAction(
  id: number,
  moderate: (id: number, moderatorId: number) => Promise<PhotoRow | null>,
): Promise<ModerationActionResult> {
  if (await checkRateLimit("photoModerate", "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }

  if (checkUserRateLimit("photoModerate", user.id, "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  if (!(await currentUserHasPermission(PERMISSIONS.PHOTOS_MODERATE))) {
    return { ok: false, error: "no_permission" };
  }

  const result = await moderate(id, user.id);
  if (!result) {
    return { ok: false, error: "already_moderated" };
  }

  return { ok: true };
}

export async function approvePhotoAction(
  id: number,
): Promise<ModerationActionResult> {
  return moderatePhotoAction(id, approvePhoto);
}

export async function rejectPhotoAction(
  id: number,
  reason: string,
): Promise<ModerationActionResult> {
  const trimmed = reason.trim().slice(0, MAX_REJECTION_REASON_LENGTH) || null;
  return moderatePhotoAction(id, (photoId, moderatorId) =>
    rejectPhoto(photoId, moderatorId, trimmed),
  );
}

export type UpdateShowAuthorResult =
  | { ok: true }
  | { ok: false; error: "not_found" | "no_session" | "rate_limited" };

export async function updatePhotoShowAuthorAction(
  id: number,
  showAuthor: boolean,
): Promise<UpdateShowAuthorResult> {
  if (await checkRateLimit("photoUpdate", "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }

  if (checkUserRateLimit("photoUpdate", user.id, "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const updated = await updateOwnPhotoShowAuthor(id, user.id, showAuthor);
  if (!updated) {
    return { ok: false, error: "not_found" };
  }

  return { ok: true };
}

export type DeletePhotoResult =
  | { ok: true }
  | { ok: false; error: "not_found" | "no_session" | "rate_limited" };

export async function deleteOwnPhotoAction(
  id: number,
): Promise<DeletePhotoResult> {
  if (await checkRateLimit("photoDelete", "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "no_session" };
  }

  if (checkUserRateLimit("photoDelete", user.id, "mutation")) {
    return { ok: false, error: "rate_limited" };
  }

  const fileName = await deleteOwnPhoto(id, user.id);
  if (!fileName) {
    return { ok: false, error: "not_found" };
  }

  await deletePhotoFile(fileName);

  return { ok: true };
}
