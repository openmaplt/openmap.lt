"use client";

import useSWR from "swr";
import { ImageGallery } from "@/components/gallery/ImageGallery";
import type { ProtectedPhotoMeta } from "@/data/protectedPhotos";
import { fetchJson } from "@/lib/fetcher";
import type { MapFeature } from "@/providers/MapProvider";

/**
 * Photo gallery for a protected area, rendered as a POI-panel extra (see
 * `poiPanelExtra` in map-profiles). Fetching the list already pulls the full
 * photo blob server-side, so it can take a moment — a skeleton stands in
 * until the images are ready.
 */
export function ProtectedPhotos({ feature }: { feature: MapFeature }) {
  const id =
    feature.properties?.id != null ? String(feature.properties.id) : null;
  const { data, isLoading } = useSWR<ProtectedPhotoMeta[]>(
    id ? `/api/saugomos/${encodeURIComponent(id)}/photos` : null,
    fetchJson,
  );
  const photos = data ?? [];

  if (!id) return null;

  // Still loading the list: show a placeholder tile so the panel doesn't jump.
  if (isLoading) {
    return (
      <div className="px-4 pt-1 pb-4">
        <div className="h-56 rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pt-1 pb-4">
      <ImageGallery
        images={photos.map((photo) => ({ url: photo.url, name: photo.name }))}
      />
    </div>
  );
}
