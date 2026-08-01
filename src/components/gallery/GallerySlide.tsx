"use client";

import { Expand } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "./types";

interface GallerySlideProps {
  image: GalleryImage;
  onOpen: () => void;
}

/** One tile in the ImageGallery's inline slider; opens the lightbox on click. */
export function GallerySlide({ image, onOpen }: GallerySlideProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Drop a photo that fails to load rather than leave its skeleton pulsing.
  if (failed) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative block h-56 w-full overflow-hidden rounded-md bg-muted"
    >
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
      {/* biome-ignore lint/performance/noImgElement: External photos don't need Next.js optimization */}
      <img
        src={image.url}
        alt={image.name}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "h-56 w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        )}
      />
      <Expand className="absolute top-2 right-2 h-6 w-6 rounded bg-black/50 p-1 text-white" />
    </button>
  );
}
