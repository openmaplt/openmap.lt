import "server-only";

import { query, queryOne } from "@/lib/db";

export async function getUserRating(
  userId: number,
  objectRef: string,
): Promise<number | null> {
  const row = await queryOne<{ rating: number }>(
    `select rating from openmap.poi_ratings where user_id = $1 and object_ref = $2`,
    [userId, objectRef],
  );
  return row?.rating ?? null;
}

// Returns the freshly recalculated community average (places.poi.rating,
// 10-50 or null — see sql/ratings.sql's trigger) so the caller can update the
// UI immediately instead of waiting for the next full POI re-fetch.
export async function setUserRating(
  userId: number,
  objectRef: string,
  rating: number | null,
): Promise<number | null> {
  if (rating === null) {
    await query(
      `delete from openmap.poi_ratings where user_id = $1 and object_ref = $2`,
      [userId, objectRef],
    );
  } else {
    await query(
      `insert into openmap.poi_ratings (user_id, object_ref, rating, updated_at)
       values ($1, $2, $3, now())
       on conflict (user_id, object_ref)
       do update set rating = excluded.rating, updated_at = excluded.updated_at`,
      [userId, objectRef, rating],
    );
  }

  const row = await queryOne<{ rating: number | null }>(
    `select rating from places.poi where id = $1::bigint`,
    [objectRef],
  );
  return row?.rating ?? null;
}
