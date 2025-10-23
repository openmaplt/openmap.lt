/**
 * URL hash utility functions for map state management
 * Format: #m/[zoom]/[latitude]/[longitude]/[bearing]/[pitch]
 */

export interface MapState {
  mapType: string;
  zoom: number;
  latitude: number;
  longitude: number;
  bearing: number;
  pitch: number;
}

const LOCALSTORAGE_KEY = "openmap_hash";

/**
 * Parse hash string to map state
 * Example: #m/14/54.93429/23.91776/0/0
 */
export function parseHash(hash: string): MapState | null {
  if (!hash || !hash.startsWith("#")) {
    return null;
  }

  const parts = hash.substring(1).split("/");
  if (parts.length !== 6) {
    return null;
  }

  const [mapType, zoomStr, latStr, lonStr, bearingStr, pitchStr] = parts;

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
  };
}

/**
 * Format map state to hash string
 */
export function formatHash(state: MapState): string {
  return `#${state.mapType}/${state.zoom.toFixed(2)}/${state.latitude.toFixed(5)}/${state.longitude.toFixed(5)}/${state.bearing.toFixed(0)}/${state.pitch.toFixed(0)}`;
}

/**
 * Save hash to localStorage
 */
export function saveHashToStorage(hash: string): void {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, hash);
  } catch (error) {
    console.warn("Failed to save hash to localStorage:", error);
  }
}

/**
 * Load hash from localStorage
 */
export function loadHashFromStorage(): string | null {
  try {
    return localStorage.getItem(LOCALSTORAGE_KEY);
  } catch (error) {
    console.warn("Failed to load hash from localStorage:", error);
    return null;
  }
}

/**
 * Get initial map state from URL hash or localStorage
 */
export function getInitialMapState(): MapState | null {
  // First try to parse from URL hash
  if (typeof window !== "undefined" && window.location.hash) {
    const state = parseHash(window.location.hash);
    if (state) {
      return state;
    }
  }

  // Fall back to localStorage
  if (typeof window !== "undefined") {
    const storedHash = loadHashFromStorage();
    if (storedHash) {
      const state = parseHash(storedHash);
      if (state) {
        return state;
      }
    }
  }

  return null;
}
