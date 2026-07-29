"use client";

import { CommentForm } from "@/components/comments/CommentForm";
import { CommentsList } from "@/components/comments/CommentsList";
import { useMapConfig, useMapSelection } from "@/providers/MapProvider";

export function CommentsSection() {
  const { selectedFeature: feature, selectedPoiId } = useMapSelection();
  const { activeMapProfile } = useMapConfig();

  if (!feature || selectedPoiId == null) return null;

  const mapProfileId = activeMapProfile.id;
  const objectRef = String(selectedPoiId);

  return (
    <div className="space-y-3 px-4 pt-2 pb-4">
      <h3 className="text-sm font-semibold text-foreground">Komentarai</h3>
      <CommentForm
        mapProfileId={mapProfileId}
        objectRef={objectRef}
        poiName={feature.properties?.name ?? null}
      />
      <CommentsList mapProfileId={mapProfileId} objectRef={objectRef} />
    </div>
  );
}
