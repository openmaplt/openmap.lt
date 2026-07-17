"use client";

import { useEffect, useState } from "react";
import {
  getProtectedPhotoList,
  type ProtectedPhotoMeta,
} from "@/data/protectedPhotos";
import { cn } from "@/lib/utils";

/**
 * Photo gallery for a protected area, shown only in the interactive POI panel
 * (not in the crawlable SEO content). Fetching the list already pulls the full
 * photo blob server-side, so it can take a moment — a skeleton stands in until
 * the images are ready, and each image fades in as it loads.
 */
export function ProtectedPhotos({ id }: { id: string }) {
  const [photos, setPhotos] = useState<ProtectedPhotoMeta[] | null>(null);

  useEffect(() => {
    let active = true;
    setPhotos(null);
    getProtectedPhotoList(id)
      .then((list) => {
        if (active) setPhotos(list);
      })
      .catch(() => {
        if (active) setPhotos([]);
      });
    return () => {
      active = false;
    };
  }, [id]);

  // Still loading the list: show placeholder tiles so the panel doesn't jump.
  if (photos === null) {
    return (
      <div className="grid grid-cols-2 gap-2 px-4 pt-1 pb-4">
        <div className="h-28 rounded-md bg-muted animate-pulse" />
        <div className="h-28 rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-2 px-4 pt-1 pb-4">
      {photos.map((photo) => (
        <PhotoTile key={photo.id} photo={photo} />
      ))}
    </div>
  );
}

function PhotoTile({ photo }: { photo: ProtectedPhotoMeta }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Drop a photo that fails to load rather than leave its skeleton pulsing.
  if (failed) {
    return null;
  }

  return (
    <a
      href={photo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block h-28 overflow-hidden rounded-md bg-muted"
    >
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
      {/* biome-ignore lint/performance/noImgElement: External STVK photos don't need Next.js optimization */}
      <img
        src={photo.url}
        alt={photo.name}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "h-28 w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
    </a>
  );
}
