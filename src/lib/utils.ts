import { createHash } from "node:crypto";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MAP_PROFILES, type MapProfile } from "@/config/map-profiles";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

export function findMapsByType(mapType: string): MapProfile | undefined {
  return MAP_PROFILES.find((profile) => profile.mapType === mapType);
}

// Only allow http(s) URLs, rejecting e.g. javascript: URIs from untrusted (OSM) data
export function toSafeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

// Matches om_slugify() PostgreSQL function logic
export function slugify(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[ąĄ]/g, "a")
    .replace(/[čČ]/g, "c")
    .replace(/[ęĘ]/g, "e")
    .replace(/[ėĖ]/g, "e")
    .replace(/[įĮ]/g, "i")
    .replace(/[šŠ]/g, "s")
    .replace(/[ųŲ]/g, "u")
    .replace(/[ūŪ]/g, "u")
    .replace(/[žŽ]/g, "z")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
