import "server-only";

import { query } from "@/lib/db";

export type UserSettings = {
  // Map profile ids the user hid from the profile switcher.
  hiddenProfileIds: string[];
};

export const DEFAULT_USER_SETTINGS: UserSettings = { hiddenProfileIds: [] };

// What `openmap.user_settings.settings` holds: only the keys that were ever
// saved, so every field is optional and missing ones fall back to defaults.
export type StoredUserSettings = Partial<UserSettings>;

export function parseUserSettings(
  stored: StoredUserSettings | null,
): UserSettings {
  return { ...DEFAULT_USER_SETTINGS, ...stored };
}

// Merges only the given keys into the stored JSON, so saving one setting
// never overwrites another one.
export async function updateUserSettings(
  userId: number,
  patch: StoredUserSettings,
): Promise<void> {
  await query(
    `insert into openmap.user_settings (user_id, settings, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (user_id)
     do update set settings = openmap.user_settings.settings || excluded.settings,
                   updated_at = excluded.updated_at`,
    [userId, JSON.stringify(patch)],
  );
}
