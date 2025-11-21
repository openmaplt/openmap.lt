/**
 * URL hash utility functions for map state management
 * Format: #m/[zoom]/[latitude]/[longitude]/[bearing]/[pitch]
 */
import { MapConfig } from "@/config/map";

export interface MapState {
  mapType: string;
  zoom: number;
  latitude: number;
  longitude: number;
  bearing: number;
  pitch: number;
  objectId?: string;
}

const LOCALSTORAGE_KEY = "openmap_state";

/**
 * Parse hash string to map state
 * Example: #m/14/54.93429/23.91776/0/0 or #m/14/54.93429/23.91776/0/0/p2811970425
 */
export function parseHash(hash: string): MapState | null {
  if (!hash || !hash.startsWith("#")) {
    return null;
  }

  const parts = hash.substring(1).split("/");
  if (parts.length !== 6 && parts.length !== 7) {
    return null;
  }

  const [mapType, zoomStr, latStr, lonStr, bearingStr, pitchStr, objectId] =
    parts;

  const zoom = Number.parseFloat(zoomStr);
  const latitude = Number.parseFloat(latStr);
  const longitude = Number.parseFloat(lonStr);
  const bearing = Number.parseFloat(bearingStr);
  const pitch = Number.parseFloat(pitchStr);

  if (
    Number.isNaN(zoom) ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    Number.isNaN(bearing) ||
    Number.isNaN(pitch)
  ) {
    return null;
  }

  return {
    mapType,
    zoom,
    latitude,
    longitude,
    bearing,
    pitch,
    objectId: objectId || undefined,
  };
}

/**
 * Format map state to hash string
 */
export function formatHash(state: MapState): string {
  const baseHash = `#${state.mapType}/${state.zoom.toFixed(2)}/${state.latitude.toFixed(5)}/${state.longitude.toFixed(5)}/${state.bearing.toFixed(0)}/${state.pitch.toFixed(0)}`;
  return state.objectId ? `${baseHash}/${state.objectId}` : baseHash;
}

/**
 * Save map state to localStorage as JSON
 */
export function saveStateToStorage(state: MapState): void {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save state to localStorage:", error);
  }
}

/**
 * Load map state from localStorage
 */
export function loadStateFromStorage(): MapState | null {
  try {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!stored) {
      return null;
    }

    return JSON.parse(stored) as MapState;
  } catch (error) {
    console.warn("Failed to load state from localStorage:", error);
    return null;
  }
}

/**
 * Get initial map state from URL hash or localStorage
 */
export function getMapState(): MapState {
  // First try to parse from URL hash
  if (typeof window !== "undefined" && window.location.hash) {
    const state = parseHash(window.location.hash);
    if (state) {
      return state;
    }
  }

  // Fall back to localStorage
  if (typeof window !== "undefined") {
    const state = loadStateFromStorage();
    if (state) {
      return state;
    }
  }

  return {
    mapType: MapConfig.DEFAULT_MAP_TYPE,
    latitude: MapConfig.DEFAULT_LATITUDE,
    longitude: MapConfig.DEFAULT_LONGITUDE,
    zoom: MapConfig.DEFAULT_ZOOM,
    bearing: 0,
    pitch: 0,
  };
}
