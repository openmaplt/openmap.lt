"use client";

import { X } from "lucide-react";
import { type KeyboardEvent, useEffect, useState } from "react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { AttributionCaption } from "./AttributionCaption";
import type { GalleryImage } from "./types";

interface PhotoLightboxProps {
  images: GalleryImage[];
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROUND_BUTTON_CLASSES =
  "border-none bg-black/50 text-white hover:bg-black/70 hover:text-white";

const CLOSE_BUTTON = (
  <DialogClose asChild>
    <button
      type="button"
      className={`absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-full ${ROUND_BUTTON_CLASSES}`}
    >
      <X className="size-4" />
      <span className="sr-only">Uždaryti</span>
    </button>
  </DialogClose>
);

// Every slide is this tall regardless of the photo's own size, so the dialog
// never resizes while swiping — vh (not h-full) so the height is definite all
// the way down the carousel without depending on an auto-height ancestor.
const STAGE_HEIGHT = "h-[65vh] sm:h-[80vh]";
const STAGE_WIDTH = "w-[min(94vw,72rem)] sm:w-[min(90vw,72rem)]";

/**
 * Fullscreen photo viewer used by ImageGallery.
 *
 * A single photo has nothing to swipe between, so the dialog just
 * shrink-wraps the photo at its natural aspect ratio (capped by viewport
 * size) — no stage, no letterboxing, no cropping.
 *
 * Multiple photos share a fixed-size stage so the dialog doesn't resize while
 * swiping through the set; object-contain there means portrait/odd-aspect
 * photos are never cropped, just letterboxed.
 */
export function PhotoLightbox({
  images,
  index,
  onIndexChange,
  open,
  onOpenChange,
}: PhotoLightboxProps) {
  const [api, setApi] = useState<CarouselApi>();
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => onIndexChange(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onIndexChange]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") api?.scrollPrev();
    if (e.key === "ArrowRight") api?.scrollNext();
  };

  if (images.length === 0) return null;

  if (!hasMultiple) {
    const image = images[0];
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="w-fit max-w-[92vw] overflow-hidden rounded-lg border-none bg-background p-0 sm:max-w-[92vw]"
        >
          <DialogTitle className="sr-only">
            {image.name || "Nuotrauka"}
          </DialogTitle>
          <div className="relative">
            {/* biome-ignore lint/performance/noImgElement: External photos don't need Next.js optimization */}
            <img
              src={image.url}
              alt={image.name || "Nuotrauka"}
              className="block h-auto max-h-[85vh] w-auto max-w-[90vw] object-contain"
            />
            <AttributionCaption image={image} />
            {CLOSE_BUTTON}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        onKeyDown={handleKeyDown}
        className={`${STAGE_WIDTH} max-w-none overflow-hidden rounded-lg border-none bg-background p-0 sm:max-w-none`}
      >
        <DialogTitle className="sr-only">
          {images[index]?.name || "Nuotrauka"}
        </DialogTitle>
        <Carousel
          setApi={setApi}
          opts={{ loop: true, startIndex: index }}
          className={STAGE_HEIGHT}
        >
          <CarouselContent className={`ml-0 ${STAGE_HEIGHT}`}>
            {images.map((image) => (
              <CarouselItem
                key={image.url}
                className={`relative pl-0 ${STAGE_HEIGHT}`}
              >
                {/* biome-ignore lint/performance/noImgElement: External photos don't need Next.js optimization */}
                <img
                  src={image.url}
                  alt={image.name || "Nuotrauka"}
                  className="h-full w-full object-contain"
                />
                <AttributionCaption image={image} />
              </CarouselItem>
            ))}
          </CarouselContent>
          {CLOSE_BUTTON}
          <CarouselPrevious className={`left-2 ${ROUND_BUTTON_CLASSES}`} />
          <CarouselNext className={`right-2 ${ROUND_BUTTON_CLASSES}`} />
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
            {index + 1} / {images.length}
          </div>
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}
