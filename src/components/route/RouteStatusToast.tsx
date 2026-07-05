"use client";

import { useRouteResult } from "@/providers/RouteProvider";

export function RouteStatusToast() {
  const { loading, error } = useRouteResult();

  if (error) {
    console.error("RouteStatusToast error:", error);
  }

  return (
    <>
      {loading && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 z-10 font-sans text-sm font-medium text-gray-800 animate-pulse">
          Skaičiuojamas maršrutas...
        </div>
      )}

      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-100/90 text-red-700 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-red-200 z-10 font-sans text-sm font-medium">
          {error}
        </div>
      )}
    </>
  );
}
