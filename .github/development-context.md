# Development Context for AI Agents - openmap.lt

## Quick Project Overview
This is the **new version** of openmap.lt application - a Lithuanian open-source map platform built with Next.js 15, React 19, and MapLibre GL.

## Immediate Context for AI Agents

### Current State
- **Status**: Early development phase
- **Core Functionality**: Basic interactive map of Lithuania
- **Architecture**: Next.js App Router with single main page
- **Deployment**: Not yet deployed (development only)

### Key Files to Understand
1. **`src/app/page.tsx`** - Main map component (client-side)
2. **`src/app/layout.tsx`** - App layout with metadata and fonts
3. **`src/app/globals.css`** - Styling with Tailwind and custom variables
4. **`package.json`** - Dependencies and build scripts
5. **`biome.json`** - Code quality configuration

### Development Environment Setup
```bash
# Prerequisites: Node.js >=24 (current: v20 with warnings)
npm install     # Install dependencies
npm run dev     # Start development server (port 3000)
npm run lint    # Check code quality
npm run format  # Auto-format code
```

### Known Issues
- **Build Issue**: Google Fonts connection fails in build (network restriction)
- **Node Version**: Project requires >=24, current environment uses v20
- **Network**: Limited internet access in development environment

### Map Configuration Summary
```typescript
// Core map setup from src/app/page.tsx
<MapLibreMap
  mapStyle="https://openmap.lt/styles/map.json"
  initialViewState={{
    latitude: 55.19114,   // Central Lithuania
    longitude: 23.871,
    zoom: 7,
  }}
  minZoom={7}
  maxZoom={18}
  maxBounds={[20.7, 53.7, 27.05, 56.65]}  // Lithuania boundaries
>
```

## Common Development Scenarios

### Adding New Features
**Typical Pattern:**
1. Modify `src/app/page.tsx` for map-related features
2. Add new components in `src/app/` or create subdirectories
3. Update styles in `src/app/globals.css` or use Tailwind classes
4. Test with `npm run dev`
5. Lint with `npm run lint`

### Styling Changes
**Approach:**
- **Primary**: Use Tailwind CSS classes
- **Custom**: CSS variables in `:root` and `@theme inline` 
- **Theme Support**: Light/dark mode via CSS variables
- **Fonts**: Geist Sans and Geist Mono (Google Fonts)

### Map Enhancements
**Focus Areas:**
- MapLibre GL component extensions
- Control additions (navigation, geolocation, etc.)
- Layer management for different map data
- Performance optimization for mobile
- Lithuania-specific geographic features

## Code Patterns in Use

### React Patterns
```typescript
// Client-side component pattern
"use client";

// Functional component with hooks
export default function Page() {
  return (
    <div className="w-full h-screen">
      {/* Map component */}
    </div>
  );
}
```

### Styling Patterns
```css
/* CSS variable pattern for theming */
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

### Import Patterns
```typescript
// MapLibre imports
import { GeolocateControl, Map as MapLibreMap, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// Font imports
import { Geist, Geist_Mono } from "next/font/google";

// Style imports
import "./globals.css";
```

## Testing & Quality Assurance

### Current QA Tools
- **Linting**: Biome with TypeScript, React, and Next.js rules
- **Formatting**: Biome with 2-space indentation
- **Type Checking**: TypeScript strict mode
- **Build**: Next.js with Turbopack bundler

### Manual Testing Checklist
- [ ] Map loads and displays Lithuania
- [ ] Navigation controls work (zoom, pan)
- [ ] Geolocation button functions
- [ ] Mobile responsiveness
- [ ] Dark/light mode compatibility
- [ ] TypeScript compilation
- [ ] Linting passes

## Project-Specific Considerations

### Lithuanian Geographic Context
- **Coordinates**: Lithuania is roughly between 53.7°-56.65°N, 20.7°-27.05°E
- **Capital**: Vilnius (54.6872°N, 25.2797°E)
- **Major Cities**: Kaunas, Klaipėda, Šiauliai, Panevėžys
- **Borders**: Latvia (north), Belarus (east), Poland (south), Kaliningrad (southwest)

### Map Style Considerations
- Lithuanian administrative boundaries
- Road network optimization for Lithuania
- Place names in Lithuanian language
- Cultural and historical points of interest
- Public transportation integration potential

### Accessibility Requirements
- WCAG 2.1 compliance target
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Touch-friendly controls for mobile

## Development Priorities

### Phase 1 (Current)
- [x] Basic map display with MapLibre
- [x] Navigation and geolocation controls
- [x] Responsive layout
- [x] Build system setup

### Phase 2 (Next Steps)
- [ ] Search functionality
- [ ] Points of interest layers
- [ ] Performance optimization
- [ ] Error handling improvements
- [ ] Progressive Web App features

### Phase 3 (Future)
- [ ] User authentication
- [ ] Data contribution features
- [ ] Advanced map layers
- [ ] Mobile app versions
- [ ] API development

## Debugging Tips for AI Agents

### Common Issues
1. **Map not loading**: Check network access to openmap.lt style server
2. **Build failures**: Often related to Google Fonts network access
3. **TypeScript errors**: Ensure proper type imports for MapLibre
4. **Styling issues**: Verify Tailwind class names and CSS variable usage

### Debug Commands
```bash
# Check build status
npm run build

# Validate linting
npm run lint

# Check TypeScript compilation
npx tsc --noEmit

# Analyze bundle (when build works)
npm run build -- --analyze
```

### Browser Console
- MapLibre GL errors usually appear in console
- Check for CSP violations
- Monitor network requests to map style server
- Verify geolocation permission status

## AI Agent Workflow Recommendations

1. **Understand Context**: Review current file before making changes
2. **Test Incrementally**: Make small changes and test frequently
3. **Follow Patterns**: Match existing code style and structure
4. **Consider Lithuania**: Keep geographic and cultural context in mind
5. **Check Compatibility**: Ensure changes work across devices/browsers
6. **Document Changes**: Update relevant documentation when needed

This context should help AI agents understand the project quickly and make informed development decisions that align with the project's goals and technical constraints.