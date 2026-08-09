import "server-only";

import { PERMISSIONS, type Permission } from "@/config/permissions";
import { getCurrentUser } from "@/lib/auth";
import { queryOneOrThrow } from "@/lib/db";
import { getUserRole, ROLES, type Role } from "@/lib/users";

export { PERMISSIONS, ROLES };
export type { Permission, Role };

export async function userHasPermission(
  userId: number,
  slug: Permission,
): Promise<boolean> {
  const role = await getUserRole(userId);
  if (role === ROLES.ADMIN) return true;

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
