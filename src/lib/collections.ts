import "server-only";

import { query, queryOne } from "@/lib/db";

export async function getUserCollectionTypeCodes(
  userId: number,
): Promise<string[]> {
  const row = await queryOne<{ type_codes: string[] }>(
    `select type_codes from openmap.user_collections where user_id = $1`,
    [userId],
  );
  return row?.type_codes ?? [];
}

export async function replaceUserCollectionTypeCodes(
  userId: number,
  typeCodes: string[],
): Promise<void> {
  await query(
    `insert into openmap.user_collections (user_id, type_codes, updated_at)
     values ($1, $2, now())
     on conflict (user_id)
     do update set type_codes = excluded.type_codes, updated_at = excluded.updated_at`,
    [userId, typeCodes],
  );
}
