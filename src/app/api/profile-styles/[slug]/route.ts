import {
  MAX_STYLE_BYTES,
  PROFILE_EDITOR_ORIGIN,
} from "@/config/custom-profiles";
import { PROFILE_VISIBILITY } from "@/domain/profileVisibility";
import { getCurrentUser } from "@/lib/auth";
import { canViewProfile, type ProfileViewer } from "@/lib/profileAccess";
import { type EditTokenPayload, verifyEditToken } from "@/lib/profileEditToken";
import { validateProfileStyle } from "@/lib/profileStyle";
import { checkRateLimit, checkUserRateLimit } from "@/lib/rateLimit";
import {
  getProfileBySlug,
  getProfileStyle,
  saveProfileStyle,
} from "@/lib/userProfiles";

// Serves and saves the style JSON of a user-created map profile.
//
// GET  — the map (same origin) and the Maputnik editor (cross origin, editor
//        token) read the style here. Access follows the profile's visibility,
//        see `canViewProfile`. A profile the caller may not see is a plain
//        404, the same as one that doesn't exist.
// PUT  — only the editor saves here, always with an editor token for exactly
//        this profile. The body is validated before it is stored.
//
// The editor lives on another origin, so it can't use the session cookie;
// CORS is therefore opened for that one origin only.

type RouteContext = { params: Promise<{ slug: string }> };

function corsHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = { Vary: "Origin" };
  if (request.headers.get("origin") === PROFILE_EDITOR_ORIGIN) {
    headers["Access-Control-Allow-Origin"] = PROFILE_EDITOR_ORIGIN;
    headers["Access-Control-Allow-Methods"] = "GET, PUT, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
    headers["Access-Control-Max-Age"] = "600";
  }
  return headers;
}

function json(
  request: Request,
  body: unknown,
  status: number,
  headers: Record<string, string> = {},
): Response {
  return Response.json(body, {
    status,
    headers: { ...corsHeaders(request), ...headers },
  });
}

function readEditToken(request: Request): EditTokenPayload | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return null;
  }
  try {
    return verifyEditToken(header.slice("Bearer ".length));
  } catch (error) {
    // Missing PROFILE_EDIT_SECRET: treat every token as invalid instead of
    // failing public reads of the same route.
    console.error("[profile-styles] žetono patikra nepavyko:", error);
    return null;
  }
}

// Reads the body but gives up as soon as it exceeds the limit, so a client
// can't make the server buffer an arbitrarily large upload.
async function readBodyCapped(
  request: Request,
  maxBytes: number,
): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) {
    return "";
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function GET(request: Request, { params }: RouteContext) {
  if (await checkRateLimit("profileStyleGet", "standard")) {
    return json(request, { error: "rate_limited" }, 429);
  }

  const { slug } = await params;
  const profile = await getProfileBySlug(slug);
  if (!profile) {
    return json(request, { error: "not_found" }, 404);
  }

  const editor = readEditToken(request);
  const viewer: ProfileViewer = {
    userId: null,
    editProfileId:
      editor && editor.userId === profile.userId ? editor.profileId : null,
    shareKey: new URL(request.url).searchParams.get("k"),
  };

  // Cheap proofs first; only fall back to a session lookup when they fail, so
  // public maps never hit the sessions table.
  let allowed = canViewProfile(profile, viewer);
  if (!allowed) {
    const user = await getCurrentUser();
    if (user) {
      allowed = canViewProfile(profile, { ...viewer, userId: user.id });
    }
  }
  if (!allowed) {
    return json(request, { error: "not_found" }, 404);
  }

  const etag = `W/"${profile.updatedAt.getTime()}"`;
  const cacheControl =
    profile.visibility === PROFILE_VISIBILITY.PUBLIC
      ? "public, max-age=60"
      : "private, no-cache";

  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ...corsHeaders(request),
        ETag: etag,
        "Cache-Control": cacheControl,
      },
    });
  }

  const style = await getProfileStyle(profile.id);
  if (!style) {
    return json(request, { error: "not_found" }, 404);
  }

  return json(request, style, 200, {
    ETag: etag,
    "Cache-Control": cacheControl,
  });
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (await checkRateLimit("profileStylePut", "mutation")) {
    return json(request, { error: "rate_limited" }, 429);
  }

  const editor = readEditToken(request);
  if (!editor) {
    return json(request, { error: "unauthorized" }, 401);
  }

  const { slug } = await params;
  const profile = await getProfileBySlug(slug);
  if (!profile) {
    return json(request, { error: "not_found" }, 404);
  }
  if (editor.profileId !== profile.id || editor.userId !== profile.userId) {
    return json(request, { error: "forbidden" }, 403);
  }

  if (checkUserRateLimit("profileStylePut", editor.userId, "mutation")) {
    return json(request, { error: "rate_limited" }, 429);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_STYLE_BYTES) {
    return json(request, { error: "too_large" }, 413);
  }
  const text = await readBodyCapped(request, MAX_STYLE_BYTES);
  if (text === null) {
    return json(request, { error: "too_large" }, 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return json(request, { error: "invalid_json" }, 400);
  }

  const result = validateProfileStyle(body);
  if (!result.ok) {
    return json(
      request,
      { error: result.error, detail: result.detail },
      result.error === "too_large" ? 413 : 400,
    );
  }

  const updatedAt = await saveProfileStyle(profile.id, result.style);
  if (!updatedAt) {
    return json(request, { error: "not_found" }, 404);
  }

  return json(request, { ok: true, updatedAt: updatedAt.toISOString() }, 200);
}
