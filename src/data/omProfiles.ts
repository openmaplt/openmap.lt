"use server";

import { queryResult } from "@/lib/db";

export interface Profile {
  name: string;
  count: number;
  description: string;
}

export async function getProfiles(): Promise<Profile[]> {
  try {
    const result = await queryResult<Profile[]>(
      "SELECT public.om_profiles() as result",
    );
    return result || [];
  } catch (err) {
    console.error("Error fetching sight profiles:", err);
    return [];
  }
}
