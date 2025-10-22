# GitHub Copilot Instructions for openmap.lt

## Project Overview
This is **openmap.lt** - an open-source Lithuanian map application built with modern web technologies. The project provides an interactive map of Lithuania with geolocation features.

## Technology Stack
- **Next.js 15** (with Turbopack)
- **React 19** with TypeScript
- **MapLibre GL JS** for map rendering
- **Tailwind CSS 4** for styling
- **Biome** for linting and formatting
- **Node.js >=24** (project requirement)

## Architecture
- **Framework**: Next.js App Router (src/app directory structure)
- **Main Components**:
  - `src/app/layout.tsx` - Root layout with fonts and metadata
  - `src/app/page.tsx` - Main map page with MapLibre integration
  - `src/app/globals.css` - Global styles with Tailwind and custom CSS variables

## Map Configuration
- **Map Style**: `https://openmap.lt/styles/map.json`
- **Default Center**: Lithuania center (55.19114, 23.871)
- **Zoom Range**: 7-18
- **Bounds**: Lithuania boundaries [20.7, 53.7, 27.05, 56.65]
- **Controls**: Navigation and Geolocation controls

## Development Patterns

### Code Style
- Use **TypeScript** for all new files
- Follow **Biome** configuration (2-space indentation)
- Use **functional components** with hooks
- Prefer **const** over let/var
- Use **template literals** for strings

### File Structure
```
src/
  app/
    layout.tsx     # Root layout
    page.tsx       # Main page (map view)
    globals.css    # Global styles
```

### CSS Guidelines
- Use **Tailwind CSS classes** primarily
- Custom CSS variables defined in `:root` and `@theme inline`
- Support both light and dark modes
- Use semantic class names

### Map Development
- Use **MapLibre GL** components from `react-map-gl/maplibre`
- Always include required CSS import: `import "maplibre-gl/dist/maplibre-gl.css"`
- Follow existing map configuration patterns
- Use proper viewport constraints for Lithuania

## Scripts and Commands
- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build with Turbopack  
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## Language and Context
- **Primary Language**: Lithuanian (UI text should be in Lithuanian)
- **Metadata**: Use Lithuanian descriptions
- **Comments**: Can be in English or Lithuanian
- **Git Messages**: Prefer Lithuanian or English

## Common Tasks

### Adding New Features
1. Create components in appropriate directories
2. Follow TypeScript strict mode
3. Use Tailwind for styling
4. Test map functionality thoroughly
5. Run linting before commits

### Map Enhancements
- Extend existing MapLibre configuration
- Maintain Lithuania-centric view
- Consider mobile responsiveness
- Test geolocation features

### Styling Changes  
- Prefer Tailwind utilities
- Use CSS variables for theming
- Support dark/light mode
- Maintain consistent spacing

## Best Practices
- Keep components focused and small
- Use proper TypeScript types
- Handle loading and error states
- Optimize for performance
- Follow accessibility guidelines
- Test across different screen sizes

## Debugging Tips
- Check browser console for MapLibre errors
- Verify map style URL accessibility
- Test geolocation permissions
- Validate TypeScript compilation
- Use React DevTools for component inspection

When working on this project, prioritize code quality, performance, and user experience while maintaining the Lithuanian map focus.