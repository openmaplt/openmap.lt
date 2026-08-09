"use client";

import { Expand } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { AttributionCaption } from "./AttributionCaption";
import { GallerySlide } from "./GallerySlide";
import { PhotoLightbox } from "./PhotoLightbox";
import type { GalleryImage } from "./types";

export type { GalleryImage } from "./types";

interface ImageGalleryProps {
  images: GalleryImage[];
  className?: string;
}

/**
 * Single place for "show some photos, click one to view it fullscreen".
 * One image renders as a plain block image (matches how a place's single
 * "image" attribute always looked); more than one renders as a one-at-a-time
 * slider with arrows. Either way, clicking the visible photo opens the same
 * `PhotoLightbox`, which can swipe through the rest of the set.
 */
export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (images.length === 0) return null;

  if (!hasMultiple) {
    const image = images[0];
    return (
      <>
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className={cn("relative block w-full", className)}
        >
          {/* biome-ignore lint/performance/noImgElement: External photos don't need Next.js optimization */}
          <img
            src={image.url}
            alt={image.name || "Nuotrauka"}
            className="h-auto max-w-full rounded-md"
            loading="lazy"
          />
          <Expand className="absolute top-2 right-2 h-6 w-6 rounded bg-black/50 p-1 text-white" />
          <AttributionCaption image={image} />
        </button>
        <PhotoLightbox
          images={images}
          index={0}
          onIndexChange={() => {}}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      </>
    );
  }

  return (
    <div className={className}>
      <Carousel setApi={setApi} opts={{ loop: true }}>
        <CarouselContent className="ml-0">
          {images.map((image) => (
            <CarouselItem key={image.url} className="pl-0">
              <GallerySlide
                image={image}
                onOpen={() => setLightboxOpen(true)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 border-none bg-black/50 text-white hover:bg-black/70 hover:text-white" />
        <CarouselNext className="right-2 border-none bg-black/50 text-white hover:bg-black/70 hover:text-white" />
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
          {current + 1} / {images.length}
        </div>
      </Carousel>

      <PhotoLightbox
        images={images}
        index={current}
        onIndexChange={(i) => {
          setCurrent(i);
          api?.scrollTo(i);
        }}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </div>
  );
}
