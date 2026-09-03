import "server-only";

import { query, queryOne } from "@/lib/db";

export type PoiDescriptionRow = {
  body: string;
  updatedAt: string;
};

export async function getPoiDescription(
  objectRef: string,
): Promise<PoiDescriptionRow | null> {
  const row = await queryOne<{ body: string; updated_at: string }>(
    `select body, updated_at from openmap.poi_descriptions where object_ref = $1`,
    [objectRef],
  );
  if (!row) return null;
  return { body: row.body, updatedAt: row.updated_at };
}

// A single shared row per object — unlike poi_ratings, this isn't scoped to
// the editing user (see sql/poi_descriptions.sql): whoever holds the
// permission overwrites the same row, and editor_id only tracks who did it
// last, not ownership.
export async function setPoiDescription(
  editorId: number,
  objectRef: string,
  body: string | null,
): Promise<void> {
  if (body === null) {
    await query(`delete from openmap.poi_descriptions where object_ref = $1`, [
      objectRef,
    ]);
    return;
  }

  await query(
    `insert into openmap.poi_descriptions (object_ref, body, editor_id, updated_at)
     values ($1, $2, $3, now())
     on conflict (object_ref)
     do update set body = excluded.body, editor_id = excluded.editor_id, updated_at = excluded.updated_at`,
    [objectRef, body, editorId],
  );
}
