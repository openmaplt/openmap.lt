"use client";

import type { Feature, LineString } from "geojson";
import { ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadGeoJSON, downloadGPX } from "@/lib/routeExport";

interface DownloadMenuProps {
  routeLine: Feature<LineString>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const items = [
  { label: "GPX", action: downloadGPX },
  { label: "GeoJSON", action: downloadGeoJSON },
];

export function DownloadMenu({
  routeLine,
  open,
  onOpenChange,
}: DownloadMenuProps) {
  return (
    <div className="relative shrink-0">
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 text-xs text-gray-600 border-gray-200 flex items-center gap-1.5"
        onClick={() => onOpenChange(!open)}
      >
        <Download className="w-3.5 h-3.5" />
        Atsisiųsti
        <ChevronDown className="w-3 h-3" />
      </Button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onMouseDown={() => onOpenChange(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-50 min-w-[120px] py-1 animate-in fade-in slide-in-from-top-1">
            {items.map(({ label, action }) => (
              <button
                key={label}
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => {
                  action(routeLine);
                  onOpenChange(false);
                }}
              >
                <Download className="w-3.5 h-3.5 text-gray-400" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
