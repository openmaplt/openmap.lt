import "server-only";

import { PERMISSIONS } from "@/config/permissions";
import { PROFILE_MODERATION } from "@/domain/profileModeration";
import { userHasPermission } from "@/lib/permissions";
import type { UserProfile } from "@/lib/userProfiles";

// Who is asking for a profile. Every field is optional proof of access.
export type ProfileViewer = {
  // Logged-in user (session cookie).
  userId: number | null;
  // Profile id an editor token was issued for (already verified).
  editProfileId: string | null;
};

// A profile is open to everyone, except while an admin has it hidden: then only
// its author (and the editor acting for them) and moderators may open it, so
// they can fix and review it. "Not allowed" and "does not exist" must look the
// same to the caller (both are a 404).
export async function canViewProfile(
  profile: Pick<UserProfile, "id" | "userId" | "moderationStatus">,
  viewer: ProfileViewer,
): Promise<boolean> {
  if (profile.moderationStatus === PROFILE_MODERATION.VISIBLE) {
    return true;
  }
  if (viewer.editProfileId === profile.id) {
    return true;
  }
  if (viewer.userId === null) {
    return false;
  }
  if (viewer.userId === profile.userId) {
    return true;
  }
  return userHasPermission(viewer.userId, PERMISSIONS.PROFILES_MODERATE);
}
