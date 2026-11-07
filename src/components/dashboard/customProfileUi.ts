import {
  MAX_PROFILES_PER_USER,
  MODERATION_NOTE_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
} from "@/config/custom-profiles";
import { PROFILE_BASE_STATUS } from "@/domain/profileBaseStatus";
import { PROFILE_MODERATION } from "@/domain/profileModeration";
import type { CustomProfileView } from "@/lib/userProfiles";

// Texts and helpers shared by the "Mano profiliai" list, the profile page and
// the admin list.

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "Per daug bandymų — pabandykite vėliau.",
  no_session: "Sesija pasibaigė — prisijunkite iš naujo.",
  not_found: "Profilis nerastas arba veiksmas nebegalimas.",
  invalid_name: `Pavadinimas turi būti 1–${PROFILE_NAME_MAX_LENGTH} simbolių.`,
  invalid_note: `Komentaras turi būti 3–${MODERATION_NOTE_MAX_LENGTH} simbolių.`,
  limit_reached: `Galite turėti ne daugiau kaip ${MAX_PROFILES_PER_USER} profilių.`,
  forbidden: "Tik administratorius gali atlikti šį veiksmą.",
  editor_unavailable: "Redaktorius kol kas neprieinamas.",
};

export const errorMessage = (error: string) =>
  ERROR_MESSAGES[error] ?? "Nepavyko atlikti veiksmo.";

// Short status badges for the author's list. A profile can be hidden or be a
// base profile (never both), or neither.
export function statusBadge(
  profile: CustomProfileView,
): { label: string; tone: "alert" | "info" } | null {
  if (profile.moderationStatus === PROFILE_MODERATION.HIDDEN) {
    return { label: "Paslėptas", tone: "alert" };
  }
  if (profile.moderationStatus === PROFILE_MODERATION.REVIEW_REQUESTED) {
    return { label: "Laukia peržiūros", tone: "alert" };
  }
  if (profile.baseStatus === PROFILE_BASE_STATUS.APPROVED) {
    return { label: "Bazinis", tone: "info" };
  }
  if (profile.baseStatus === PROFILE_BASE_STATUS.REQUESTED) {
    return { label: "Laukia patvirtinimo", tone: "info" };
  }
  return null;
}

export const profilePath = (profile: CustomProfileView) =>
  `/paskyra/mano-profiliai/${profile.slug}`;

// The address to send to someone.
export const shareUrl = (profile: Pick<CustomProfileView, "slug">) =>
  new URL(`/m/${profile.slug}`, window.location.origin).toString();
