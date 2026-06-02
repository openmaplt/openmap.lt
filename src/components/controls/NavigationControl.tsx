"use client";

import { Minus, Navigation2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMapActions, useMapTransform } from "@/providers/MapProvider";

const btnStyle =
  "p-2 bg-white rounded-lg shadow-lg border border-gray-300 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center";

export function NavigationControl() {
  const { mapRef } = useMapActions();
  const { viewState } = useMapTransform();
  const bearing = viewState?.bearing ?? 0;
  const isNorthUp = Math.abs(bearing) < 0.5;

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-lg border border-gray-300 shadow-lg bg-white">
        <button
          className="p-2 hover:bg-gray-100 transition-colors flex items-center justify-center"
          onClick={() => mapRef.current?.getMap().zoomIn({ duration: 200 })}
          title="Artinti"
          type="button"
        >
          <Plus className="size-4 text-gray-700" />
        </button>
        <div className="border-t border-gray-200" />
        <button
          className="p-2 hover:bg-gray-100 transition-colors flex items-center justify-center"
          onClick={() => mapRef.current?.getMap().zoomOut({ duration: 200 })}
          title="Tolinti"
          type="button"
        >
          <Minus className="size-4 text-gray-700" />
        </button>
      </div>

      <button
        className={cn(btnStyle, isNorthUp && "opacity-50")}
        onClick={() =>
          mapRef.current?.getMap().easeTo({ bearing: 0, duration: 300 })
        }
        title="Šiaurė viršuje"
        type="button"
      >
        <Navigation2
          className="size-4 text-red-500"
          style={{ transform: `rotate(${-bearing}deg)` }}
        />
      </button>
    </>
  );
}
