"use server";

import { query } from "@/lib/db";

export interface Profile {
  name: string;
  count: number;
  description: string;
}

export async function getProfiles(): Promise<Profile[]> {
  try {
    const res = await query("SELECT public.om_profiles() as result");
    return (res.rows[0]?.result as Profile[]) || [];
  } catch (err) {
    console.error("Error fetching sight profiles:", err);
    return [];
  }
}
