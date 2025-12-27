import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MAP_PROFILES, type MapProfile } from "@/config/map-profiles";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function findMapsByType(mapType: string): MapProfile | undefined {
  return MAP_PROFILES.find((profile) => profile.mapType === mapType);
}

export function slugify(str: string): string {
  if (!str) return "";

  const charMap: Record<string, string> = {
    ą: "a",
    č: "c",
    ę: "e",
    ė: "e",
    į: "i",
    š: "s",
    ų: "u",
    ū: "u",
    ž: "z",
  };

  return str
    .toString()
    .toLowerCase()
    .trim()
    .split("")
    .map((char) => charMap[char] || char)
    .join("")
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
