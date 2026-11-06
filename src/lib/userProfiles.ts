import "server-only";

import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  MAX_PROFILES_PER_USER,
  PROFILE_TEMPLATE_STYLE_FILE,
} from "@/config/custom-profiles";
import {
  PROFILE_BASE_STATUS,
  type ProfileBaseStatus,
} from "@/domain/profileBaseStatus";
import {
  PROFILE_VISIBILITY,
  type ProfileVisibility,
} from "@/domain/profileVisibility";
import { query, queryOne, queryOneOrThrow } from "@/lib/db";
import { slugify } from "@/lib/utils";

// User-created map profiles (openmap.user_profiles, sql/user_profiles.sql).
// `updated_at` is the version of the *style* only (it is the style's ETag and
// cache-busting value), so renaming or changing visibility does not touch it.

type ProfileRow = {
  id: string;
  user_id: number;
  slug: string;
  name: string;
  visibility: ProfileVisibility;
  base_status: ProfileBaseStatus;
  share_key: string | null;
  expires_at: Date | null;
  updated_at: Date;
  base_approved_at: Date | null;
};

// Never `select *`: `style` can be hundreds of KB and most callers only list
// profiles.
const PROFILE_COLUMN_LIST = [
  "id",
  "user_id",
  "slug",
  "name",
  "visibility",
  "base_status",
  "share_key",
  "expires_at",
  "updated_at",
  "base_approved_at",
];
const PROFILE_COLUMNS = PROFILE_COLUMN_LIST.join(", ");

export type UserProfile = {
  id: string;
  userId: number;
  slug: string;
  name: string;
  visibility: ProfileVisibility;
  baseStatus: ProfileBaseStatus;
  // Secret: only ever handed to the owner.
  shareKey: string | null;
  expiresAt: Date | null;
  // Last change of the content (style or name). Also the style's ETag.
  updatedAt: Date;
  // When an admin last approved it as a base profile (or approved its later
  // changes); null unless approved. `updatedAt` after it means it changed since.
  baseApprovedAt: Date | null;
};

function toProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    name: row.name,
    visibility: row.visibility,
    baseStatus: row.base_status,
    shareKey: row.share_key,
    expiresAt: row.expires_at,
    updatedAt: row.updated_at,
    baseApprovedAt: row.base_approved_at,
  };
}

// What the client gets: dates as ISO strings. `shareKey` is the owner's secret,
// so only ever build this for the owner (or an admin queue, which omits it).
export type CustomProfileView = {
  id: string;
  slug: string;
  name: string;
  visibility: ProfileVisibility;
  baseStatus: ProfileBaseStatus;
  shareKey: string | null;
  expiresAt: string | null;
  updatedAt: string;
};

export function toProfileView(profile: UserProfile): CustomProfileView {
  return {
    id: profile.id,
    slug: profile.slug,
    name: profile.name,
    visibility: profile.visibility,
    baseStatus: profile.baseStatus,
    shareKey: profile.shareKey,
    expiresAt: profile.expiresAt?.toISOString() ?? null,
    updatedAt: profile.updatedAt.toISOString(),
  };
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Ids come from clients; a malformed one would make Postgres throw on the
// uuid cast instead of simply finding nothing.
export function isProfileId(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function generateShareKey(): string {
  return randomBytes(16).toString("base64url");
}

export async function getProfileBySlug(
  slug: string,
): Promise<UserProfile | null> {
  const row = await queryOne<ProfileRow>(
    `select ${PROFILE_COLUMNS} from openmap.user_profiles where slug = $1`,
    [slug.toLowerCase()],
  );
  return row ? toProfile(row) : null;
}

export async function getOwnedProfile(
  userId: number,
  id: string,
): Promise<UserProfile | null> {
  if (!isProfileId(id)) {
    return null;
  }
  const row = await queryOne<ProfileRow>(
    `select ${PROFILE_COLUMNS} from openmap.user_profiles
     where id = $1 and user_id = $2`,
    [id, userId],
  );
  return row ? toProfile(row) : null;
}

export async function getOwnedProfileBySlug(
  userId: number,
  slug: string,
): Promise<UserProfile | null> {
  const row = await queryOne<ProfileRow>(
    `select ${PROFILE_COLUMNS} from openmap.user_profiles
     where slug = $1 and user_id = $2`,
    [slug.toLowerCase(), userId],
  );
  return row ? toProfile(row) : null;
}

export async function listUserProfiles(userId: number): Promise<UserProfile[]> {
  const result = await query(
    `select ${PROFILE_COLUMNS} from openmap.user_profiles
     where user_id = $1
     order by created_at`,
    [userId],
  );
  return (result.rows as ProfileRow[]).map(toProfile);
}

// Profiles an admin approved as base profiles: shown to every visitor in the
// profile switcher. `base_status = 'approved'` implies `public` (table check).
export async function listApprovedProfiles(): Promise<UserProfile[]> {
  const result = await query(
    `select ${PROFILE_COLUMNS} from openmap.user_profiles
     where base_status = 'approved'
     order by name`,
  );
  return (result.rows as ProfileRow[]).map(toProfile);
}

// A profile together with who owns it, for the admin lists. `ownerEmail` is
// what an admin writes to when a base profile needs a word with its author
// (it is null for sign-ins that provide none, e.g. OpenStreetMap).
export type ProfileWithOwner = UserProfile & {
  ownerName: string | null;
  ownerEmail: string | null;
};

async function listProfilesWithOwner(
  baseStatus: ProfileBaseStatus,
): Promise<ProfileWithOwner[]> {
  const result = await query(
    `select ${PROFILE_COLUMN_LIST.map((column) => `p.${column}`).join(", ")},
            coalesce(u.name, u.username) as owner_name, u.email as owner_email
     from openmap.user_profiles p
     join openmap.users u on u.id = p.user_id
     where p.base_status = $1::openmap.profile_base_status
     order by p.created_at`,
    [baseStatus],
  );
  return (
    result.rows as (ProfileRow & {
      owner_name: string | null;
      owner_email: string | null;
    })[]
  ).map((row) => ({
    ...toProfile(row),
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
  }));
}

// Admin queue: profiles whose owner asked for them to become base profiles.
export const listRequestedProfiles = () =>
  listProfilesWithOwner(PROFILE_BASE_STATUS.REQUESTED);

// Admin list of the current base profiles, so one that drifts from what was
// approved can be taken off the list again.
export const listApprovedProfilesWithOwner = () =>
  listProfilesWithOwner(PROFILE_BASE_STATUS.APPROVED);

// The style JSON lives apart from the other columns so it is only read when it
// is actually served.
export async function getProfileStyle(id: string): Promise<unknown | null> {
  const row = await queryOne<{ style: unknown }>(
    `select style from openmap.user_profiles where id = $1`,
    [id],
  );
  return row?.style ?? null;
}

export async function saveProfileStyle(
  id: string,
  style: unknown,
): Promise<Date | null> {
  const row = await queryOne<{ updated_at: Date }>(
    `update openmap.user_profiles
     set style = $2::jsonb, updated_at = now()
     where id = $1
     returning updated_at`,
    [id, JSON.stringify(style)],
  );
  return row?.updated_at ?? null;
}

let templateStyle: unknown | null = null;

// New profiles start as a copy of a built-in style (public/styles/). `public/`
// sits next to the server in the Docker image (see Dockerfile), so cwd works
// in dev, `next start` and the standalone build.
async function loadTemplateStyle(): Promise<unknown> {
  if (!templateStyle) {
    const file = path.join(
      process.cwd(),
      "public",
      "styles",
      PROFILE_TEMPLATE_STYLE_FILE,
    );
    templateStyle = JSON.parse(await readFile(file, "utf8"));
  }
  return templateStyle;
}

// Candidate slugs for a profile name: the name itself, then numbered
// variants, then a random suffix, so creation never fails on a taken name.
export function slugCandidates(name: string): string[] {
  const base = slugify(name).slice(0, 30).replace(/-+$/, "");
  const root =
    base.length >= 3 ? base : base ? `${base}-zemelapis` : "zemelapis";
  const candidates = [root];
  for (let n = 2; n <= 5; n++) {
    candidates.push(`${root}-${n}`);
  }
  candidates.push(`${root}-${randomBytes(3).toString("hex")}`);
  return candidates;
}

export type CreateProfileResult =
  | { ok: true; profile: UserProfile }
  | { ok: false; error: "limit_reached" };

export async function createProfile(
  userId: number,
  name: string,
): Promise<CreateProfileResult> {
  const { count } = await queryOneOrThrow<{ count: string }>(
    `select count(*) as count from openmap.user_profiles where user_id = $1`,
    [userId],
  );
  if (Number.parseInt(count, 10) >= MAX_PROFILES_PER_USER) {
    return { ok: false, error: "limit_reached" };
  }

  const style = JSON.stringify(await loadTemplateStyle());

  for (const slug of slugCandidates(name)) {
    const row = await queryOne<ProfileRow>(
      `insert into openmap.user_profiles (user_id, slug, name, style)
       values ($1, $2, $3, $4::jsonb)
       on conflict (slug) do nothing
       returning ${PROFILE_COLUMNS}`,
      [userId, slug, name, style],
    );
    if (row) {
      return { ok: true, profile: toProfile(row) };
    }
  }
  // Every candidate (including the random one) was taken.
  throw new Error("Nepavyko sugeneruoti unikalaus profilio slug'o.");
}

export async function renameProfile(
  userId: number,
  id: string,
  name: string,
): Promise<UserProfile | null> {
  if (!isProfileId(id)) {
    return null;
  }
  const row = await queryOne<ProfileRow>(
    `update openmap.user_profiles set name = $3, updated_at = now()
     where id = $1 and user_id = $2
     returning ${PROFILE_COLUMNS}`,
    [id, userId, name],
  );
  return row ? toProfile(row) : null;
}

export async function deleteProfile(
  userId: number,
  id: string,
): Promise<boolean> {
  if (!isProfileId(id)) {
    return false;
  }
  const row = await queryOne(
    `delete from openmap.user_profiles
     where id = $1 and user_id = $2
     returning id`,
    [id, userId],
  );
  return row !== null;
}

// Rules enforced here (and by table checks): a `link` profile always has a
// share key (a fresh one when switching to `link`), leaving `link` drops the
// key so old links die for good, and anything but `public` loses its base
// status so a hidden map can't stay in everyone's profile switcher.
export async function setProfileVisibility(
  userId: number,
  id: string,
  visibility: ProfileVisibility,
  expiresAt: Date | null,
): Promise<UserProfile | null> {
  if (!isProfileId(id)) {
    return null;
  }
  const isLink = visibility === PROFILE_VISIBILITY.LINK;
  const row = await queryOne<ProfileRow>(
    `update openmap.user_profiles
     set visibility = $3::openmap.profile_visibility
        ,share_key = case when $3::openmap.profile_visibility = 'link'
                          then coalesce(share_key, $4) else null end
        ,expires_at = case when $3::openmap.profile_visibility = 'link'
                           then $5::timestamptz else null end
        ,base_status = case when $3::openmap.profile_visibility = 'public'
                            then base_status else 'none' end
        ,base_approved_at = case when $3::openmap.profile_visibility = 'public'
                                 then base_approved_at else null end
     where id = $1 and user_id = $2
     returning ${PROFILE_COLUMNS}`,
    [
      id,
      userId,
      visibility,
      isLink ? generateShareKey() : null,
      isLink ? expiresAt : null,
    ],
  );
  return row ? toProfile(row) : null;
}

export async function regenerateShareKey(
  userId: number,
  id: string,
): Promise<UserProfile | null> {
  if (!isProfileId(id)) {
    return null;
  }
  const row = await queryOne<ProfileRow>(
    `update openmap.user_profiles set share_key = $3
     where id = $1 and user_id = $2 and visibility = 'link'
     returning ${PROFILE_COLUMNS}`,
    [id, userId, generateShareKey()],
  );
  return row ? toProfile(row) : null;
}

// Owner asks for the profile to become a base profile. Only public profiles
// qualify, since a base profile is shown to everyone.
export async function requestBaseStatus(
  userId: number,
  id: string,
): Promise<UserProfile | null> {
  if (!isProfileId(id)) {
    return null;
  }
  const row = await queryOne<ProfileRow>(
    `update openmap.user_profiles set base_status = 'requested'
     where id = $1 and user_id = $2
       and visibility = 'public' and base_status = 'none'
     returning ${PROFILE_COLUMNS}`,
    [id, userId],
  );
  return row ? toProfile(row) : null;
}

// Owner takes a pending request back. An approved profile can't be withdrawn
// here; the owner has to make it non-public (which clears it), or an admin
// revokes it.
export async function withdrawBaseRequest(
  userId: number,
  id: string,
): Promise<UserProfile | null> {
  if (!isProfileId(id)) {
    return null;
  }
  const row = await queryOne<ProfileRow>(
    `update openmap.user_profiles set base_status = 'none'
     where id = $1 and user_id = $2 and base_status = 'requested'
     returning ${PROFILE_COLUMNS}`,
    [id, userId],
  );
  return row ? toProfile(row) : null;
}

// Admin decision. `approved` needs a public profile that was requested (or is
// already approved); `none` rejects a request or revokes an approval.
// Approving an already approved profile re-stamps `base_approved_at`: "I looked
// at its changes, they are fine".
export async function setBaseStatusAsAdmin(
  id: string,
  status: typeof PROFILE_BASE_STATUS.APPROVED | typeof PROFILE_BASE_STATUS.NONE,
): Promise<UserProfile | null> {
  if (!isProfileId(id)) {
    return null;
  }
  const row = await queryOne<ProfileRow>(
    `update openmap.user_profiles
     set base_status = $2::openmap.profile_base_status
        ,base_approved_at = case when $2::openmap.profile_base_status = 'approved'
                                 then now() else null end
     where id = $1
       and ($2::openmap.profile_base_status = 'none'
            or (visibility = 'public' and base_status in ('requested', 'approved')))
     returning ${PROFILE_COLUMNS}`,
    [id, status],
  );
  return row ? toProfile(row) : null;
}
