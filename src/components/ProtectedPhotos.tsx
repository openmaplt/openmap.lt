"use client";

import useSWR from "swr";
import { PoiPhotoGallery } from "@/components/gallery/PoiPhotoGallery";
import type { ProtectedPhotoMeta } from "@/data/protectedPhotos";
import { fetchJson } from "@/lib/fetcher";
import {
  type MapFeature,
  useMapConfig,
  useMapSelection,
} from "@/providers/MapProvider";

/**
 * Photo gallery for a protected area, rendered as a POI-panel extra (see
 * `poiPanelExtra` in map-profiles). Fetches the STVK photo list itself (that
 * already pulls the full photo blob server-side, so it can take a moment — a
 * skeleton stands in until the images are ready), then hands the result to
 * PoiPhotoGallery as `externalImages` — PoiPhotoGallery always additionally
 * fetches+shows our own user-uploaded photos, merging both into one gallery.
 */
export function ProtectedPhotos({ feature }: { feature: MapFeature }) {
  const { selectedPoiId } = useMapSelection();
  const { activeMapProfile } = useMapConfig();
  const id =
    feature.properties?.id != null ? String(feature.properties.id) : null;
  const { data, isLoading } = useSWR<ProtectedPhotoMeta[]>(
    id ? `/api/saugomos/${encodeURIComponent(id)}/photos` : null,
    fetchJson,
  );
  const photos = data ?? [];

  if (!id || selectedPoiId == null) return null;

  // Still loading the STVK list: show a placeholder tile so the panel
  // doesn't jump (our own uploaded photos load independently, right after).
  if (isLoading) {
    return (
      <div className="px-4 pt-1 pb-4">
        <div className="h-56 rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <PoiPhotoGallery
      mapProfileId={activeMapProfile.id}
      objectRef={String(selectedPoiId)}
      poiName={feature.properties?.name ?? null}
      externalImages={photos.map((photo) => ({
        url: photo.url,
        name: photo.name,
        attribution: {
          source: "Saugomų teritorijų valstybės kadastras (STVK)",
        },
      }))}
    />
  );
}
