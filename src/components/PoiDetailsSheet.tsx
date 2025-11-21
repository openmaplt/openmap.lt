"use client";

import { PoiContent } from "@/components/PoiContent";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { PoiData } from "@/lib/poiData";

interface PoiDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  data: PoiData | null;
}

export function PoiDetailsSheet({
  open,
  onOpenChange,
  title,
  data,
}: PoiDetailsSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side={isDesktop ? "left" : "bottom"}
        className="overflow-y-auto gap-1"
      >
        <SheetHeader>
          <SheetTitle className="text-lg text-foreground mr-5">
            {title}
          </SheetTitle>
        </SheetHeader>
        {data && <PoiContent data={data} />}
      </SheetContent>
    </Sheet>
  );
}
