# Code Patterns and Examples for openmap.lt

## TypeScript Patterns

### Component Structure
```typescript
// Client-side component (for interactive features)
"use client";

import { useState, useEffect } from "react";
import { Map as MapLibreMap } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapComponentProps {
  initialZoom?: number;
  className?: string;
}

export default function MapComponent({ 
  initialZoom = 7, 
  className = "w-full h-screen" 
}: MapComponentProps) {
  const [viewState, setViewState] = useState({
    latitude: 55.19114,
    longitude: 23.871,
    zoom: initialZoom,
  });

  return (
    <div className={className}>
      <MapLibreMap
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="https://openmap.lt/styles/map.json"
        minZoom={7}
        maxZoom={18}
        maxBounds={[20.7, 53.7, 27.05, 56.65]}
      />
    </div>
  );
}
```

### Type Definitions
```typescript
// Geographic types for Lithuania
export interface LithuanianCoordinate {
  lat: number; // Between 53.7 and 56.65
  lng: number; // Between 20.7 and 27.05
}

export interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Map layer configuration
export interface LayerConfig {
  id: string;
  type: 'fill' | 'line' | 'symbol' | 'circle' | 'heatmap';
  source: string;
  paint?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  filter?: unknown[];
}
```

### Error Handling Patterns
```typescript
// Map error handling
export function useMapError() {
  const [error, setError] = useState<string | null>(null);
  
  const handleMapError = (event: { error: Error }) => {
    console.error('Map error:', event.error);
    setError(`Žemėlapio klaida: ${event.error.message}`);
  };
  
  return { error, handleMapError, clearError: () => setError(null) };
}

// Geolocation error handling
export function useGeolocation() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError('Geolokacija nepalaikoma šioje naršyklėje');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      setPosition,
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Geolokacijos leidimas atmestas');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Vieta nepasiekiama');
            break;
          case err.TIMEOUT:
            setError('Geolokacijos užklausa baigėsi');
            break;
          default:
            setError('Nežinoma geolokacijos klaida');
            break;
        }
      }
    );
  };
  
  return { position, error, getCurrentPosition };
}
```

## Styling Patterns

### Tailwind + CSS Variables
```css
/* globals.css - Theme system */
:root {
  --background: #ffffff;
  --foreground: #171717;
  --primary: #2563eb;
  --secondary: #64748b;
  --accent: #f59e0b;
  --border: #e2e8f0;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-accent: var(--accent);
  --color-border: var(--border);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
    --primary: #3b82f6;
    --secondary: #94a3b8;
    --accent: #fbbf24;
    --border: #334155;
  }
}

/* Map container styling */
.map-container {
  @apply w-full h-screen relative;
}

.map-controls {
  @apply absolute top-4 left-4 z-10 flex flex-col gap-2;
}

.map-overlay {
  @apply absolute inset-0 pointer-events-none;
}
```

### Component Styling
```typescript
// Styled components with Tailwind
export function MapControls({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border">
      {children}
    </div>
  );
}

export function MapButton({ 
  onClick, 
  icon, 
  label, 
  variant = 'primary' 
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <button
      onClick={onClick}
      className={`
        p-2 rounded-md transition-colors
        ${variant === 'primary' 
          ? 'bg-primary text-white hover:bg-primary/90' 
          : 'bg-secondary/20 text-foreground hover:bg-secondary/30'}
      `}
      title={label}
    >
      {icon}
    </button>
  );
}
```

## Map Integration Patterns

### Custom Map Controls
```typescript
import { useControl } from "react-map-gl/maplibre";
import type { ControlPosition } from "react-map-gl/maplibre";

class CustomControl {
  private container: HTMLDivElement;
  
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
  }
  
  onAdd() {
    const button = document.createElement('button');
    button.className = 'maplibregl-ctrl-icon';
    button.innerHTML = '📍';
    button.title = 'Rodyti Vilnių';
    button.onclick = () => {
      // Navigate to Vilnius
      if (this.map) {
        this.map.flyTo({
          center: [25.2797, 54.6872], // Vilnius coordinates
          zoom: 12
        });
      }
    };
    
    this.container.appendChild(button);
    return this.container;
  }
  
  onRemove() {
    this.container.parentNode?.removeChild(this.container);
  }
}

export function VilniusControl({ position = 'top-right' }: { position?: ControlPosition }) {
  useControl(() => new CustomControl(), { position });
  return null;
}
```

### Layer Management
```typescript
import { useMap } from "react-map-gl/maplibre";

export function useMapLayers() {
  const { current: map } = useMap();
  
  const addLayer = (layer: LayerConfig) => {
    if (!map) return;
    
    try {
      if (!map.getLayer(layer.id)) {
        map.addLayer(layer);
      }
    } catch (error) {
      console.error('Error adding layer:', error);
    }
  };
  
  const removeLayer = (layerId: string) => {
    if (!map) return;
    
    try {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    } catch (error) {
      console.error('Error removing layer:', error);
    }
  };
  
  const toggleLayer = (layerId: string) => {
    if (!map) return;
    
    const visibility = map.getLayoutProperty(layerId, 'visibility');
    map.setLayoutProperty(
      layerId, 
      'visibility', 
      visibility === 'visible' ? 'none' : 'visible'
    );
  };
  
  return { addLayer, removeLayer, toggleLayer };
}
```

## Data Patterns

### GeoJSON Types for Lithuania
```typescript
// Common Lithuanian geographic features
export interface LithuanianCity {
  name: string;
  nameEn: string;
  coordinates: [number, number]; // [lng, lat]
  population: number;
  county: string;
}

export interface LithuanianCounty {
  name: string;
  nameEn: string;
  center: [number, number];
  area: number; // km²
  population: number;
}

// GeoJSON structure for Lithuanian features
export interface LithuanianFeature extends GeoJSON.Feature {
  properties: {
    name: string;
    nameEn?: string;
    type: 'city' | 'county' | 'municipality' | 'river' | 'lake';
    population?: number;
    area?: number;
    [key: string]: unknown;
  };
}

export type LithuanianGeoJSON = GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  LithuanianFeature['properties']
>;
```

### API Integration Patterns
```typescript
// Fetch Lithuanian geographic data
export async function fetchLithuanianData<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`https://openmap.lt/api/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Search Lithuanian places
export async function searchLithuanianPlaces(query: string) {
  return fetchLithuanianData<LithuanianCity[]>(`search?q=${encodeURIComponent(query)}`);
}
```

## Performance Patterns

### Map Optimization
```typescript
// Debounced map updates
import { useMemo, useCallback } from "react";
import { debounce } from "lodash-es";

export function useOptimizedMap() {
  const debouncedUpdate = useMemo(
    () => debounce((viewState: MapViewState) => {
      // Expensive operations here
      console.log('Map updated:', viewState);
    }, 300),
    []
  );
  
  const handleMapMove = useCallback((evt: { viewState: MapViewState }) => {
    debouncedUpdate(evt.viewState);
  }, [debouncedUpdate]);
  
  return { handleMapMove };
}

// Conditional layer loading
export function useConditionalLayers() {
  const { current: map } = useMap();
  
  useEffect(() => {
    if (!map) return;
    
    const handleZoomEnd = () => {
      const zoom = map.getZoom();
      
      // Show detailed layers only at high zoom
      if (zoom > 12) {
        map.setLayoutProperty('detailed-roads', 'visibility', 'visible');
        map.setLayoutProperty('buildings', 'visibility', 'visible');
      } else {
        map.setLayoutProperty('detailed-roads', 'visibility', 'none');
        map.setLayoutProperty('buildings', 'visibility', 'none');
      }
    };
    
    map.on('zoomend', handleZoomEnd);
    return () => map.off('zoomend', handleZoomEnd);
  }, [map]);
}
```

## Testing Patterns

### Map Testing Utilities
```typescript
// Mock MapLibre for testing
export const createMockMap = () => ({
  getZoom: jest.fn(() => 10),
  getCenter: jest.fn(() => ({ lat: 55.19114, lng: 23.871 })),
  flyTo: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
});

// Test utilities for Lithuanian coordinates
export function isValidLithuanianCoordinate(coord: LithuanianCoordinate): boolean {
  return (
    coord.lat >= 53.7 && coord.lat <= 56.65 &&
    coord.lng >= 20.7 && coord.lng <= 27.05
  );
}

export function isWithinLithuaniaBounds(lat: number, lng: number): boolean {
  return isValidLithuanianCoordinate({ lat, lng });
}
```

Follow these patterns to maintain consistency with the existing codebase and Lithuanian geographic context. Always consider performance, accessibility, and user experience when implementing new features.