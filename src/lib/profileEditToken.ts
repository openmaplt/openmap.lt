import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { EDIT_TOKEN_TTL_SECONDS } from "@/config/custom-profiles";

// Short-lived bearer token handed to the Maputnik editor (a different origin,
// so it can't use the `om_session` cookie). It grants read + write access to
// exactly one profile of one user — nothing else — and expires on its own.
// Not to be confused with the profile's `share_key` (`?k=`), which gives
// read-only access to viewers of a `link` profile.

export type EditTokenPayload = {
  userId: number;
  profileId: string;
};

type StoredPayload = { u: number; p: string; e: number };

function getSecret(): string {
  const secret = process.env.PROFILE_EDIT_SECRET;
  // Read lazily: the app must still build and run (without the editor) when
  // the variable is not set.
  if (!secret || secret.length < 32) {
    throw new Error(
      "PROFILE_EDIT_SECRET aplinkos kintamasis nenustatytas arba per trumpas (reikia bent 32 simbolių).",
    );
  }
  return secret;
}

function sign(body: string): string {
  return createHmac("sha256", getSecret()).update(body).digest("base64url");
}

export function createEditToken(
  payload: EditTokenPayload,
  now: number = Date.now(),
): string {
  const stored: StoredPayload = {
    u: payload.userId,
    p: payload.profileId,
    e: Math.floor(now / 1000) + EDIT_TOKEN_TTL_SECONDS,
  };
  const body = Buffer.from(JSON.stringify(stored)).toString("base64url");
  return `${body}.${sign(body)}`;
}

// Returns null for anything wrong with the token (malformed, forged, expired),
// so callers can't tell the cases apart.
export function verifyEditToken(
  token: string,
  now: number = Date.now(),
): EditTokenPayload | null {
  const [body, signature, ...rest] = token.split(".");
  if (!body || !signature || rest.length > 0) {
    return null;
  }

  const expected = Buffer.from(sign(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return null;
  }

  let stored: StoredPayload;
  try {
    stored = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (
    typeof stored.u !== "number" ||
    typeof stored.p !== "string" ||
    typeof stored.e !== "number" ||
    stored.e * 1000 <= now
  ) {
    return null;
  }

  return { userId: stored.u, profileId: stored.p };
}
