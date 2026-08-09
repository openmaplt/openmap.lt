import "server-only";

import { query, queryOne } from "@/lib/db";

export const ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export async function getUserRole(userId: number): Promise<Role | null> {
  const row = await queryOne<{ role: Role | null }>(
    `select role from openmap.users where id = $1`,
    [userId],
  );
  return row?.role ?? null;
}

export type ModerationRecipient = {
  email: string;
  canModerateComments: boolean;
  canModeratePhotos: boolean;
};

// Admins, plus moderators individually granted comments.moderate or
// photos.moderate — addressees for the daily pending-approvals digest
// (src/lib/moderationDigest.ts). Per-recipient flags let the digest send a
// moderator only the section(s) they actually have permission for — e.g. a
// photos-only moderator shouldn't hear about pending comments.
export async function listModerationRecipients(): Promise<
  ModerationRecipient[]
> {
  const result = await query(
    `select u.email,
            bool_or(u.role = 'admin' or p.slug = 'comments.moderate') as can_moderate_comments,
            bool_or(u.role = 'admin' or p.slug = 'photos.moderate') as can_moderate_photos
     from openmap.users u
     left join openmap.user_permissions up on up.user_id = u.id
     left join openmap.permissions p on p.id = up.permission_id
          and p.slug in ('comments.moderate', 'photos.moderate')
     where u.email is not null
       and (u.role = 'admin' or p.id is not null)
     group by u.id, u.email`,
  );
  return result.rows.map((row) => ({
    email: row.email,
    canModerateComments: row.can_moderate_comments,
    canModeratePhotos: row.can_moderate_photos,
  }));
}
