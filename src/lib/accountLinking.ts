import "server-only";

import {
  backfillUserProfile,
  findUserAuth,
  insertUserAuth,
  type ProviderProfile,
} from "@/lib/auth";
import { query } from "@/lib/db";
import type { Provider } from "@/lib/oauth/providers";
import { PG_UNIQUE_VIOLATION } from "@/lib/pgErrorCodes";

export type LinkedAccount = {
  provider: Provider;
  label: string | null;
};

export type LinkResult =
  | { ok: true }
  | { ok: false; error: "already_linked_elsewhere" };

/**
 * "link" intent: only ever attaches the provider identity to the given (already
 * logged-in) currentUserId — never creates a new user, never switches sessions.
 */
export async function resolveLink(
  provider: Provider,
  profile: ProviderProfile,
  currentUserId: number,
): Promise<LinkResult> {
  const existingUserId = await findUserAuth(provider, profile.providerUserId);
  if (existingUserId !== null) {
    if (existingUserId !== currentUserId) {
      return { ok: false, error: "already_linked_elsewhere" };
    }
    await backfillUserProfile(currentUserId, profile);
    return { ok: true };
  }

  try {
    await insertUserAuth(currentUserId, provider, profile);
  } catch (error) {
    if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
      const retryUserId = await findUserAuth(provider, profile.providerUserId);
      if (retryUserId !== null && retryUserId !== currentUserId) {
        return { ok: false, error: "already_linked_elsewhere" };
      }
      await backfillUserProfile(currentUserId, profile);
      return { ok: true };
    }
    throw error;
  }
  await backfillUserProfile(currentUserId, profile);
  return { ok: true };
}

export type UnlinkResult =
  | { ok: true }
  | { ok: false; error: "last_remaining_method" };

export async function unlinkProvider(
  userId: number,
  provider: Provider,
): Promise<UnlinkResult> {
  const countResult = await query(
    `select count(*)::int as count from openmap.user_auths where user_id = $1`,
    [userId],
  );
  if (countResult.rows[0].count <= 1) {
    return { ok: false, error: "last_remaining_method" };
  }

  await query(
    `delete from openmap.user_auths where user_id = $1 and provider = $2`,
    [userId, provider],
  );
  return { ok: true };
}

export async function getLinkedProviders(
  userId: number,
): Promise<LinkedAccount[]> {
  const result = await query(
    `select provider, email from openmap.user_auths where user_id = $1 order by provider`,
    [userId],
  );
  return result.rows.map((row) => ({
    provider: row.provider as Provider,
    label: row.email,
  }));
}
