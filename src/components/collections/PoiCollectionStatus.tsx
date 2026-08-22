"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  POI_COLLECTION_STATUS,
  POI_COLLECTION_UNVISITED,
  type PoiCollectionStatusOption,
  type PoiCollectionStatusValue,
} from "@/domain/collectionStatus";
import { usePoiCollectionStatus } from "@/hooks/use-poi-collection-status";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<PoiCollectionStatusOption, string> = {
  [POI_COLLECTION_UNVISITED]: "Neaplankyta",
  [POI_COLLECTION_STATUS.VISITED]: "Aplankyta",
  [POI_COLLECTION_STATUS.NOT_INTERESTING]: "Neįdomu",
};

// Neutral/bordered for the default "unvisited" state, soft green/red for the
// other two — deliberately muted, not the strong PLACES_FILTERS category
// colors, since this is a personal marker, not a map legend.
const STATUS_STYLES: Record<PoiCollectionStatusOption, string> = {
  [POI_COLLECTION_UNVISITED]: "border-input text-muted-foreground",
  [POI_COLLECTION_STATUS.VISITED]:
    "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400",
  [POI_COLLECTION_STATUS.NOT_INTERESTING]:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
};

export function PoiCollectionStatus() {
  const { isEligible, status, setStatus } = usePoiCollectionStatus();

  if (!isEligible) return null;

  const value: PoiCollectionStatusOption = status ?? POI_COLLECTION_UNVISITED;

  const handleChange = (next: string) => {
    setStatus(
      next === POI_COLLECTION_UNVISITED
        ? null
        : (next as PoiCollectionStatusValue),
    );
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger
        className={cn(
          "h-auto w-auto rounded-full px-3 py-1.5 gap-1.5 shadow-none",
          STATUS_STYLES[value],
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(STATUS_LABELS) as PoiCollectionStatusOption[]).map(
          (option) => (
            <SelectItem key={option} value={option}>
              {STATUS_LABELS[option]}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
}
