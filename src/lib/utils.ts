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
  str = str.replace(/^\s+|\s+$/g, ""); // trim leading/trailing white space
  str = str.toLowerCase(); // convert string to lowercase
  str = str
    .replace(/[^a-z0-9 -]/g, "") // remove any non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-"); // remove consecutive hyphens
  return str;
}
