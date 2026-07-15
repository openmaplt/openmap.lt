"use server";

import { query } from "@/lib/db";

export interface ClassObject {
  url: string;
  name: string;
  description?: string;
}

export async function getProfileClassObjects(
  profile: string,
  className: string,
): Promise<ClassObject[]> {
  try {
    const res = await query(
      "SELECT public.om_profile_class_objects($1, $2) as result",
      [profile, className],
    );
    const result = res.rows[0]?.result;
    return Array.isArray(result) ? (result as ClassObject[]) : [];
  } catch (err) {
    console.error(
      "Error fetching objects for profile/class:",
      profile,
      className,
      err,
    );
    return [];
  }
}
