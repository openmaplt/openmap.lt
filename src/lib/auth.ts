"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import type { Provider } from "@/lib/oauth/providers";
import { PG_UNIQUE_VIOLATION } from "@/lib/pgErrorCodes";
import { hash } from "@/lib/utils";

const SESSION_COOKIE_NAME = "om_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type PublicUser = {
  id: number;
  username: string | null;
  name: string | null;
  avatarUrl: string | null;
};

export type ProviderProfile = {
  providerUserId: string;
  username: string | null;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
};

function toPublicUser(row: {
  id: number;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
}): PublicUser {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    avatarUrl: row.avatar_url,
  };
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const result = await query(
    `select u.id, u.username, u.name, u.avatar_url
     from openmap.sessions s
     join openmap.users u on u.id = s.user_id
     where s.token_hash = $1 and s.expires_at > now()`,
    [hash(token)],
  );
  if (result.rows.length === 0) return null;

  return toPublicUser(result.rows[0]);
}

export async function createSession(userId: number): Promise<void> {
  const store = await cookies();

  const previousToken = store.get(SESSION_COOKIE_NAME)?.value;
  if (previousToken) {
    await query(`delete from openmap.sessions where token_hash = $1`, [
      hash(previousToken),
    ]);
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await query(
    `insert into openmap.sessions (token_hash, user_id, expires_at) values ($1, $2, $3)`,
    [hash(token), userId, expiresAt],
  );

  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await query(`delete from openmap.sessions where token_hash = $1`, [
      hash(token),
    ]);
  }
  store.delete(SESSION_COOKIE_NAME);
}

async function createUser(profile: ProviderProfile): Promise<number> {
  const result = await query(
    `insert into openmap.users (username, name, email, avatar_url) values ($1, $2, $3, $4) returning id`,
    [profile.username, profile.name, profile.email, profile.avatarUrl],
  );
  return result.rows[0].id as number;
}

// Shared with src/lib/accountLinking.ts — both login and account-linking need
// to attach a (provider, provider_user_id) row to a user.
export async function insertUserAuth(
  userId: number,
  provider: Provider,
  profile: ProviderProfile,
): Promise<void> {
  await query(
    `insert into openmap.user_auths (user_id, provider, provider_user_id, email)
     values ($1, $2, $3, $4)`,
    [userId, provider, profile.providerUserId, profile.email],
  );
}

// Shared with src/lib/accountLinking.ts.
export async function findUserAuth(
  provider: Provider,
  providerUserId: string,
): Promise<number | null> {
  const result = await query(
    `select user_id from openmap.user_auths where provider = $1 and provider_user_id = $2`,
    [provider, providerUserId],
  );
  return result.rows.length > 0 ? (result.rows[0].user_id as number) : null;
}

/**
 * Fills in users columns that are still empty using data from a provider
 * profile — e.g. OSM never gives name/email/avatar_url, so linking a Google
 * account afterwards should backfill those, without ever overwriting a value
 * that's already set (by another provider or, later, by the user themselves).
 * Shared with src/lib/accountLinking.ts.
 */
export async function backfillUserProfile(
  userId: number,
  profile: ProviderProfile,
): Promise<void> {
  await query(
    `update openmap.users
     set username = coalesce(username, $2)
        ,name = coalesce(name, $3)
        ,email = coalesce(email, $4)
        ,avatar_url = coalesce(avatar_url, $5)
     where id = $1`,
    [userId, profile.username, profile.name, profile.email, profile.avatarUrl],
  );
}

/**
 * "login" intent: always resolves purely from what the provider returns, regardless of
 * any currently active session (switching the active session if it resolves to a
 * different existing user is the intended, standard sign-in behavior).
 */
export async function resolveLogin(
  provider: Provider,
  profile: ProviderProfile,
): Promise<{ userId: number }> {
  const existingUserId = await findUserAuth(provider, profile.providerUserId);
  if (existingUserId !== null) {
    await backfillUserProfile(existingUserId, profile);
    return { userId: existingUserId };
  }

  const userId = await createUser(profile);
  try {
    await insertUserAuth(userId, provider, profile);
  } catch (error) {
    if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
      const retryUserId = await findUserAuth(provider, profile.providerUserId);
      if (retryUserId !== null) return { userId: retryUserId };
    }
    throw error;
  }
  return { userId };
}
