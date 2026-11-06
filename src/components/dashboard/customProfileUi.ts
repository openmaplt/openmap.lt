import {
  MAX_PROFILES_PER_USER,
  PROFILE_NAME_MAX_LENGTH,
} from "@/config/custom-profiles";
import { PROFILE_BASE_STATUS } from "@/domain/profileBaseStatus";
import {
  PROFILE_VISIBILITY,
  type ProfileVisibility,
} from "@/domain/profileVisibility";
import type { CustomProfileView } from "@/lib/userProfiles";

// Texts and helpers shared by the "Mano profiliai" list and the profile page.

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "Per daug bandymų — pabandykite vėliau.",
  no_session: "Sesija pasibaigė — prisijunkite iš naujo.",
  not_found: "Profilis nerastas.",
  invalid_name: `Pavadinimas turi būti 1–${PROFILE_NAME_MAX_LENGTH} simbolių.`,
  limit_reached: `Galite turėti ne daugiau kaip ${MAX_PROFILES_PER_USER} profilių.`,
  invalid_visibility: "Neteisingas matomumas.",
  invalid_expiry: "Galiojimo data turi būti ateityje.",
  editor_unavailable: "Redaktorius kol kas neprieinamas.",
};

export const errorMessage = (error: string) =>
  ERROR_MESSAGES[error] ?? "Nepavyko atlikti veiksmo.";

// Full wording, for the visibility select.
export const VISIBILITY_OPTION_LABELS: Record<ProfileVisibility, string> = {
  [PROFILE_VISIBILITY.PRIVATE]: "Privatus (tik aš)",
  [PROFILE_VISIBILITY.LINK]: "Pagal slaptą nuorodą",
  [PROFILE_VISIBILITY.PUBLIC]: "Viešas (kas turi adresą)",
};

// Short wording, for badges in the list.
export const VISIBILITY_BADGE_LABELS: Record<ProfileVisibility, string> = {
  [PROFILE_VISIBILITY.PRIVATE]: "Privatus",
  [PROFILE_VISIBILITY.LINK]: "Pagal nuorodą",
  [PROFILE_VISIBILITY.PUBLIC]: "Viešas",
};

export const VISIBILITY_HINTS: Record<ProfileVisibility, string> = {
  [PROFILE_VISIBILITY.PRIVATE]: "Atidaryti gali tik jūs.",
  [PROFILE_VISIBILITY.LINK]:
    "Atidaryti gali tik tie, kam nusiuntėte nuorodą su slaptu raktu.",
  [PROFILE_VISIBILITY.PUBLIC]:
    "Atidaryti gali bet kas, žinantis adresą. Paieškos sistemos jo neindeksuos.",
};

export function baseStatusBadge(profile: CustomProfileView): string | null {
  if (profile.baseStatus === PROFILE_BASE_STATUS.APPROVED) return "Bazinis";
  if (profile.baseStatus === PROFILE_BASE_STATUS.REQUESTED)
    return "Laukia patvirtinimo";
  return null;
}

export const profilePath = (profile: CustomProfileView) =>
  `/paskyra/mano-profiliai/${profile.slug}`;

// The address to send to someone. A `link` map is useless without its secret.
export function shareUrl(profile: CustomProfileView): string {
  const url = new URL(`/m/${profile.slug}`, window.location.origin);
  if (profile.visibility === PROFILE_VISIBILITY.LINK && profile.shareKey) {
    url.searchParams.set("k", profile.shareKey);
  }
  return url.toString();
}

// `<input type="date">` works in local dates; a link stays valid through the
// end of the chosen day.
export const toDateInput = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("sv-SE") : "";
export const fromDateInput = (value: string) =>
  value ? new Date(`${value}T23:59:59`).toISOString() : null;
