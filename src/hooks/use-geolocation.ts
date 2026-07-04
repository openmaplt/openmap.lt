"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface GeolocationState {
  isLocating: boolean;
  position: [number, number] | null;
  accuracy: number | null;
  error: GeolocationPositionError | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    isLocating: false,
    position: null,
    accuracy: null,
    error: null,
  });
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null)
        navigator.geolocation?.clearWatch(watchIdRef.current);
    };
  }, []);

  const start = useCallback(() => {
    if (!navigator.geolocation) return;
    setState((s) => ({ ...s, isLocating: true, error: null }));
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) =>
        setState((s) => ({
          ...s,
          position: [coords.longitude, coords.latitude],
          accuracy: coords.accuracy,
          error: null,
        })),
      (error) => {
        watchIdRef.current = null;
        setState({ isLocating: false, position: null, accuracy: null, error });
      },
      { enableHighAccuracy: true },
    );
  }, []);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState({
      isLocating: false,
      position: null,
      accuracy: null,
      error: null,
    });
  }, []);

  const toggle = useCallback(() => {
    if (watchIdRef.current !== null) stop();
    else start();
  }, [start, stop]);

  return { ...state, start, stop, toggle };
}
