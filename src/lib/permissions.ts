import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { queryOne, queryOneOrThrow } from "@/lib/db";

export const ROLES = {
  ADMIN: "admin",
  MODERATOR: "moderator",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  COMMENTS_MODERATE: "comments.moderate",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export async function userHasPermission(
  userId: number,
  slug: Permission,
): Promise<boolean> {
  const userRow = await queryOne<{ role: Role | null }>(
    `select role from openmap.users where id = $1`,
    [userId],
  );
  if (userRow?.role === ROLES.ADMIN) return true;

  const row = await queryOneOrThrow<{ has_permission: boolean }>(
    `select exists (
       select 1
       from openmap.user_permissions up
       join openmap.permissions p on p.id = up.permission_id
       where up.user_id = $1 and p.slug = $2
     ) as has_permission`,
    [userId, slug],
  );
  return row.has_permission;
}

export async function currentUserHasPermission(
  slug: Permission,
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return userHasPermission(user.id, slug);
}
