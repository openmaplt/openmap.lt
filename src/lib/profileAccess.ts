import { timingSafeEqual } from "node:crypto";
import {
  PROFILE_VISIBILITY,
  type ProfileVisibility,
} from "@/domain/profileVisibility";

// Who is asking for a profile. Every field is optional proof of access; the
// first one that matches wins.
export type ProfileViewer = {
  // Logged-in user (session cookie).
  userId: number | null;
  // Profile id an editor token was issued for (already verified).
  editProfileId: string | null;
  // `?k=` value from the URL.
  shareKey: string | null;
};

export type AccessibleProfile = {
  id: string;
  userId: number;
  visibility: ProfileVisibility;
  shareKey: string | null;
  expiresAt: Date | null;
};

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// "Not allowed" and "does not exist" must look the same to the caller (both
// are a 404), so a private map never reveals that it exists.
export function canViewProfile(
  profile: AccessibleProfile,
  viewer: ProfileViewer,
  now: Date = new Date(),
): boolean {
  if (viewer.userId !== null && viewer.userId === profile.userId) {
    return true;
  }
  if (viewer.editProfileId === profile.id) {
    return true;
  }
  if (profile.visibility === PROFILE_VISIBILITY.PUBLIC) {
    return true;
  }
  if (profile.visibility === PROFILE_VISIBILITY.LINK) {
    if (profile.expiresAt && profile.expiresAt <= now) {
      return false;
    }
    return (
      profile.shareKey !== null &&
      viewer.shareKey !== null &&
      safeEqual(profile.shareKey, viewer.shareKey)
    );
  }
  return false;
}
