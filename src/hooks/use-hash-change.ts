import { useEffect } from "react";

/**
 * Custom hook to listen for hash changes in the URL
 * @param callback Function to call when hash changes
 */
export function useHashChange(callback: () => void) {
  useEffect(() => {
    window.addEventListener("hashchange", callback);
    return () => window.removeEventListener("hashchange", callback);
  }, [callback]);
}
