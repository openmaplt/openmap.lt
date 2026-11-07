import "server-only";

import { cache } from "react";
import { MAP_PROFILES, type MapProfile } from "@/config/map-profiles";
import { getCurrentUser } from "@/lib/auth";
import { customMapType } from "@/lib/mapPath";
import { canViewProfile } from "@/lib/profileAccess";
import {
  getProfileBySlug,
  listApprovedProfiles,
  listUserProfiles,
  type UserProfile,
} from "@/lib/userProfiles";

// Which user-created profiles a visitor sees in the profile switcher, plus the
// one their URL points at. Anonymous visitors get the admin-approved base
// profiles; logged-in ones also get their own; whoever opens `/m/<slug>` (and
// is allowed to) also gets that one, which is how a shared map shows up.
// Profiles are public by default, so a shared address is just `/m/<slug>`.

// Several server components of one request (generateMetadata + the page) ask
// for the same user; fetch the session once.
export const getViewer = cache(() => getCurrentUser());

// Placeholder thumbnail for the switcher until a profile has its own. New
// profiles start as a copy of the topo template.
const CUSTOM_PROFILE_IMAGE = "/maps/map_topo.png";

export function toMapProfile(profile: UserProfile): MapProfile {
  // `v` busts the browser cache whenever the content changes.
  const params = new URLSearchParams({
    v: String(profile.updatedAt.getTime()),
  });
  return {
    id: `user-${profile.id}`,
    mapType: customMapType(profile.slug),
    mapStyles: [
      {
        name: profile.name,
        style: `/api/profile-styles/${profile.slug}?${params}`,
        image: CUSTOM_PROFILE_IMAGE,
      },
    ],
    interactiveLayers: ["label-amenity"],
    isCustom: true,
  };
}

export type OpenedProfile = {
  profile: UserProfile;
  // Only the owner and admin-approved profiles may be indexed by search
  // engines; everything else is reachable by URL only.
  indexable: boolean;
};

// The profile `/m/<slug>` points at, or null when it doesn't exist or the
// visitor may not see it (a hidden one, see canViewProfile; deliberately
// indistinguishable from a missing one: both are a 404).
export const getOpenedProfile = cache(
  async (
    slug: string,
    userId: number | null,
  ): Promise<OpenedProfile | null> => {
    const profile = await getProfileBySlug(slug);
    if (
      !profile ||
      !(await canViewProfile(profile, { userId, editProfileId: null }))
    ) {
      return null;
    }
    return { profile, indexable: profile.baseStatus === "approved" };
  },
);

export async function getViewerProfiles(
  userId: number | null,
  opened: UserProfile | null,
): Promise<MapProfile[]> {
  const byId = new Map<string, MapProfile>();

  // User-created profiles are an add-on: if listing them fails (say the table
  // was not migrated yet) the built-in map must still load.
  try {
    const [approved, own] = await Promise.all([
      listApprovedProfiles(),
      userId === null ? Promise.resolve([]) : listUserProfiles(userId),
    ]);
    for (const profile of [...approved, ...own]) {
      byId.set(profile.id, toMapProfile(profile));
    }
  } catch (error) {
    console.error("[viewerProfiles] nepavyko gauti naudotojų profilių:", error);
  }
  if (opened) {
    byId.set(opened.id, toMapProfile(opened));
  }
  return [...byId.values()];
}

// Every profile that can show up in this user's switcher (and so can be hidden
// from it in /paskyra/profiliai): built-in, admin-approved and their own.
export async function listSelectableProfiles(
  userId: number,
): Promise<MapProfile[]> {
  return [...MAP_PROFILES, ...(await getViewerProfiles(userId, null))];
}
