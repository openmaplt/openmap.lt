import "server-only";

import { getProtectedAreaPhotos } from "@/lib/stvk";

export interface ProtectedPhotoMeta {
  id: string;
  name: string;
  url: string;
}

/**
 * Lightweight photo list for a protected area — metadata only, no base64. Each
 * entry points at the image route that streams the actual JPEG, so the client
 * never receives the heavy base64 payload.
 */
export async function getProtectedPhotoList(
  id: string,
): Promise<ProtectedPhotoMeta[]> {
  if (!/^\d+$/.test(id)) {
    return [];
  }

  const photos = await getProtectedAreaPhotos(id);
  return photos
    .filter((photo) => /^\d+$/.test(photo.id))
    .map((photo) => ({
      id: photo.id,
      name: photo.name,
      url: `/api/saugomos/${id}/photos/${photo.id}`,
    }));
}
