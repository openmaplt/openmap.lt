# AI Agent Instructions for openmap.lt Project

## Projekto aprašymas (Project Description)
**openmap.lt** yra atvirojo kodo Lietuvos žemėlapio aplikacija, sukurta naudojant modernias web technologijas. Projektas teikia interaktyvų Lietuvos žemėlapį su geolokacijos funkcijomis.

**openmap.lt** is an open-source Lithuanian map application built with modern web technologies, providing an interactive map of Lithuania with geolocation features.

## Technologijos ir architektūra (Technologies and Architecture)

### Core Technologies
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript
- **Map Engine**: MapLibre GL JS (open-source fork of Mapbox GL JS)
- **Styling**: Tailwind CSS 4 with custom CSS variables
- **Development Tools**: Biome (linter/formatter), Turbopack (bundler)
- **Runtime**: Node.js >=24

### Project Structure
```
├── src/app/              # Next.js App Router
│   ├── layout.tsx        # Root layout with fonts & metadata
│   ├── page.tsx          # Main map page
│   └── globals.css       # Global styles
├── public/               # Static assets
├── .github/              # AI agent instructions
├── biome.json            # Linter configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Map Configuration Details

### MapLibre Setup
- **Style Source**: `https://openmap.lt/styles/map.json` (custom Lithuanian map style)
- **Initial View**: 
  - Latitude: 55.19114
  - Longitude: 23.871 
  - Zoom: 7
- **Constraints**:
  - Min Zoom: 7, Max Zoom: 18
  - Bounds: [20.7, 53.7, 27.05, 56.65] (Lithuania boundaries)
- **Controls**: NavigationControl & GeolocateControl (top-left position)

### Required Imports
```typescript
import { GeolocateControl, Map as MapLibreMap, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
```

## Development Guidelines

### Code Quality Standards
1. **TypeScript**: Always use strict TypeScript
2. **Formatting**: Follow Biome configuration (2-space indentation)
3. **Components**: Functional components with React hooks
4. **Performance**: Optimize for mobile and desktop
5. **Accessibility**: Follow WCAG guidelines

### Styling Approach
- **Primary**: Tailwind CSS utility classes
- **Theming**: CSS custom properties for light/dark modes
- **Responsive**: Mobile-first approach
- **Typography**: Geist Sans and Geist Mono fonts

### File Naming Conventions
- **Components**: PascalCase (.tsx files)
- **Utilities**: camelCase (.ts files) 
- **Styles**: kebab-case (.css files)
- **Constants**: SCREAMING_SNAKE_CASE

## Development Workflow

### Local Development
```bash
npm install        # Install dependencies
npm run dev        # Start development server
npm run lint       # Check code quality
npm run format     # Format code
npm run build      # Build for production
```

### Common Development Tasks

#### Adding New Map Features
1. Extend MapLibre configuration in `src/app/page.tsx`
2. Import required MapLibre components
3. Test across different zoom levels
4. Verify mobile responsiveness
5. Check Lithuania bounds constraints

#### Styling Updates
1. Use Tailwind utilities first
2. Add custom CSS variables if needed
3. Test light/dark mode compatibility
4. Ensure responsive design
5. Maintain consistent spacing

#### Component Development
1. Create in appropriate directory structure
2. Use TypeScript interfaces for props
3. Handle loading and error states
4. Add proper accessibility attributes
5. Test component isolation

## Lithuanian Context

### Language Guidelines
- **UI Text**: Lithuanian language preferred
- **Code Comments**: English or Lithuanian acceptable
- **Documentation**: Bilingual when helpful
- **Git Messages**: Lithuanian or English

### Geographic Context
- **Focus Area**: Lithuania (Lietuva)
- **Coordinate System**: WGS84 (EPSG:4326)
- **Default View**: Central Lithuania
- **Boundaries**: Restricted to Lithuanian territory
- **Neighboring Countries**: Latvia, Belarus, Poland, Kaliningrad

## Performance Considerations

### Map Performance
- Lazy load map tiles
- Optimize marker rendering for large datasets
- Use clustering for point data
- Implement proper zoom-level styling
- Cache map resources when possible

### Bundle Optimization
- Tree-shake unused MapLibre features
- Optimize font loading
- Minimize CSS bundle size
- Use Next.js image optimization
- Implement proper code splitting

## Security & Privacy

### Map Data
- Use HTTPS for all map resources
- Validate external data sources
- Implement proper CSP headers
- Handle geolocation permissions properly

### User Privacy
- Request geolocation permissions explicitly
- Don't store location data unnecessarily
- Follow GDPR compliance for EU users
- Provide clear privacy information

## Testing Strategies

### Manual Testing
- Test across different browsers
- Verify mobile responsiveness
- Check geolocation functionality
- Test map interactions (pan, zoom, controls)
- Validate accessibility features

### Automated Testing (when implemented)
- Unit tests for utility functions
- Component testing with React Testing Library
- E2E testing for map interactions
- Visual regression testing for UI changes

## Common Issues & Solutions

### Map Loading Issues
- Verify map style URL accessibility
- Check network connectivity to tile servers
- Validate MapLibre GL CSS import
- Ensure proper container sizing

### Build Issues
- Node.js version compatibility (>=24)
- Font loading failures (network issues)
- TypeScript compilation errors
- Turbopack configuration conflicts

### Performance Issues
- Map tile loading optimization
- Bundle size analysis
- Memory usage monitoring
- Mobile performance testing

## Contribution Guidelines

### Before Making Changes
1. Understand the existing codebase structure
2. Check for related issues or PRs
3. Test locally with `npm run dev`
4. Run linting with `npm run lint`

### Code Review Checklist
- [ ] TypeScript compilation passes
- [ ] Biome linting passes
- [ ] Map functionality works correctly
- [ ] Mobile responsiveness verified
- [ ] Accessibility requirements met
- [ ] Performance impact considered

### Documentation Updates
- Update AI instructions if architecture changes
- Add code comments for complex logic
- Update README.md if user-facing changes
- Document new environment variables or configuration

## Future Development Directions

### Potential Features
- Advanced map layers (traffic, satellite, terrain)
- Search and geocoding functionality
- Route planning and navigation
- Points of interest integration
- User-contributed content
- Offline map support

### Technical Improvements
- Progressive Web App (PWA) features
- Advanced caching strategies
- Server-side rendering optimization
- Performance monitoring
- Automated testing suite
- CI/CD pipeline improvements

Remember: This project serves the Lithuanian community with an open, accessible mapping solution. Always consider the local context and user needs when making development decisions.