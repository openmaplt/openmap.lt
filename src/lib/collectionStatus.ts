import "server-only";

import type { PoiCollectionStatusValue } from "@/domain/collectionStatus";
import { query, queryOne } from "@/lib/db";

export async function getUserPoiStatus(
  userId: number,
  objectRef: string,
): Promise<PoiCollectionStatusValue | null> {
  const row = await queryOne<{ status: PoiCollectionStatusValue }>(
    `select status from openmap.poi_collection_status where user_id = $1 and object_ref = $2`,
    [userId, objectRef],
  );
  return row?.status ?? null;
}

export async function setUserPoiStatus(
  userId: number,
  objectRef: string,
  status: PoiCollectionStatusValue | null,
): Promise<void> {
  if (status === null) {
    await query(
      `delete from openmap.poi_collection_status where user_id = $1 and object_ref = $2`,
      [userId, objectRef],
    );
    return;
  }

  await query(
    `insert into openmap.poi_collection_status (user_id, object_ref, status, updated_at)
     values ($1, $2, $3, now())
     on conflict (user_id, object_ref)
     do update set status = excluded.status, updated_at = excluded.updated_at`,
    [userId, objectRef, status],
  );
}
