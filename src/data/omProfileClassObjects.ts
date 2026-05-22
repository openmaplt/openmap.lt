"use server";

import { query } from "@/lib/db";

export interface SightObject {
  url: string;
  icon: string;
  description: string;
}

export async function getProfileClassObjects(
  profile: string,
  className: string,
): Promise<SightObject[]> {
  try {
    const res = await query(
      "SELECT public.om_profile_classe_objects($1, $2) as result",
      [profile, className],
    );
    return (res.rows[0]?.result as SightObject[]) || [];
  } catch (err) {
    console.error(`Error fetching objects for ${profile}/${className}:`, err);
    return [];
  }
}
