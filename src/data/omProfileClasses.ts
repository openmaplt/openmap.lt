"use server";

import { query } from "@/lib/db";

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
    const res = await query("SELECT public.om_profile_classes($1) as result", [
      profile,
    ]);
    return (res.rows[0]?.result as ProfileClass[]) || [];
  } catch (err) {
    console.error("Error fetching classes for profile:", profile, err);
    return [];
  }
}
