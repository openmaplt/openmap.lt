"use server";

import { queryResult } from "@/lib/db";

export interface ProfileClass {
  name: string;
  icon: string;
  count: number;
  description: string;
}

export async function getProfileClasses(
  profile: string,
): Promise<ProfileClass[]> {
  try {
    const result = await queryResult<ProfileClass[]>(
      "SELECT public.om_profile_classes($1) as result",
      [profile],
    );
    return result || [];
  } catch (err) {
    console.error("Error fetching classes for profile:", profile, err);
    return [];
  }
}
