import {
  type StyleSpecification,
  validateStyleMin,
} from "@maplibre/maplibre-gl-style-spec";
import { MAX_STYLE_BYTES } from "@/config/custom-profiles";

export type StyleValidationError =
  | "too_large"
  | "not_object"
  | "bad_version"
  | "invalid_style"
  | "forbidden_url";

export type StyleValidationResult =
  | { ok: true; style: StyleSpecification }
  | { ok: false; error: StyleValidationError; detail?: string };

// Any https address is allowed (people publish tile and data services to be
// used in other people's maps; a service that doesn't allow it simply fails to
// load, which the author sees in the editor). http, data:, javascript:, file:,
// pmtiles:// and URLs with embedded credentials are refused. The app's CSP
// (`connect-src https:`, `img-src https:`) is what lets the browser load them.
// Note this means viewers' browsers contact whatever hosts the style names.
export function isAllowedStyleUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === "https:" && !url.username && !url.password;
}

function asStrings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

// Every URL a style makes the viewer's browser load.
function collectStyleUrls(style: Record<string, unknown>): string[] {
  const urls: string[] = [];

  urls.push(...asStrings(style.glyphs));

  const sprite = style.sprite;
  if (Array.isArray(sprite)) {
    for (const entry of sprite) {
      if (entry && typeof entry === "object") {
        urls.push(...asStrings((entry as { url?: unknown }).url));
      }
    }
  } else {
    urls.push(...asStrings(sprite));
  }

  const sources = style.sources;
  if (sources && typeof sources === "object") {
    for (const source of Object.values(sources)) {
      if (!source || typeof source !== "object") {
        continue;
      }
      const record = source as Record<string, unknown>;
      urls.push(
        ...asStrings(record.url),
        ...asStrings(record.urls),
        ...asStrings(record.tiles),
      );
      // GeoJSON `data` is either inline JSON (an object) or a URL.
      if (typeof record.data === "string") {
        urls.push(record.data);
      }
    }
  }

  return urls;
}

export function validateProfileStyle(raw: unknown): StyleValidationResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "not_object" };
  }

  if (Buffer.byteLength(JSON.stringify(raw)) > MAX_STYLE_BYTES) {
    return { ok: false, error: "too_large" };
  }

  const record = raw as Record<string, unknown>;
  if (record.version !== 8) {
    return { ok: false, error: "bad_version" };
  }

  const errors = validateStyleMin(raw as StyleSpecification);
  if (errors.length > 0) {
    return { ok: false, error: "invalid_style", detail: errors[0].message };
  }

  const forbidden = collectStyleUrls(record).find(
    (url) => !isAllowedStyleUrl(url),
  );
  if (forbidden) {
    return { ok: false, error: "forbidden_url", detail: forbidden };
  }

  return { ok: true, style: raw as StyleSpecification };
}
