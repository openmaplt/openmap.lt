"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { PoiRatingLabel } from "@/components/ratings/PoiRatingLabel";
import { POI_RATING_MAX, POI_RATING_MIN } from "@/domain/rating";
import { usePoiRating } from "@/hooks/use-poi-rating";
import { cn } from "@/lib/utils";

const STARS = Array.from(
  { length: POI_RATING_MAX - POI_RATING_MIN + 1 },
  (_, i) => POI_RATING_MIN + i,
);

export function PoiRating() {
  const { isEligible, canRate, averageRating, myRating, setMyRating } =
    usePoiRating();
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  if (!isEligible) return null;

  // Before you've rated (or if you can't), the stars mirror the community
  // average — same as everyone else sees — so the widget doesn't suddenly
  // change shape the moment you log in. Only once you've picked your own
  // rating do the stars switch to reflecting that instead.
  const baseFilled =
    canRate && myRating != null
      ? myRating
      : averageRating != null
        ? Math.round(averageRating)
        : 0;
  const filledStars = hoverRating ?? baseFilled;

  const handleClick = (value: number) => {
    if (!canRate) return;
    setMyRating(myRating === value ? null : value);
  };

  return (
    <div
      className="flex items-center gap-2"
      onMouseLeave={() => setHoverRating(null)}
    >
      <div className="flex items-center">
        {STARS.map((value) => (
          <button
            key={value}
            type="button"
            disabled={!canRate}
            onClick={() => handleClick(value)}
            onMouseEnter={() => canRate && setHoverRating(value)}
            className={cn(
              "outline-none",
              canRate ? "cursor-pointer" : "cursor-default",
            )}
            aria-label={`Vertinti ${value} iš ${POI_RATING_MAX} žvaigždučių`}
          >
            <Star
              className={cn(
                "size-4",
                value <= filledStars
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        <PoiRatingLabel
          canRate={canRate}
          myRating={myRating}
          averageRating={averageRating}
        />
      </span>
    </div>
  );
}
