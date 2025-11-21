import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MAPS, type MapProfile } from "@/config/map";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function findMapsByType(mapType: string): MapProfile | undefined {
  return MAPS.find((profile) => profile.mapType === mapType);
}
