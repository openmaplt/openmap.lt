"use client";

import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/toast";
import { useRouteResult } from "@/providers/RouteProvider";

export function RouteStatusToast() {
  const { loading, error } = useRouteResult();
  const loadingToastId = useRef<string | number | null>(null);

  useEffect(() => {
    if (loading) {
      loadingToastId.current = toast.loading("Skaičiuojamas maršrutas...");
      return;
    }
    if (loadingToastId.current !== null) {
      toast.dismiss(loadingToastId.current);
      loadingToastId.current = null;
    }
  }, [loading]);

  useEffect(() => {
    if (!error) return;
    console.error("RouteStatusToast error:", error);
    toast.error(error);
  }, [error]);

  return null;
}
