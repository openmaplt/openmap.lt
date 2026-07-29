"use server";

import { queryResult } from "@/lib/db";

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
    const result = await queryResult(
      "SELECT public.om_profile_class_objects($1, $2) as result",
      [profile, className],
    );
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
