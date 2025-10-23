# POI Click Implementation - Summary

## What Was Implemented

This implementation adds interactive POI (Point of Interest) functionality to the openmap.lt map, allowing users to click on map features and view detailed information.

## Key Features

### 1. Interactive POI Clicks
- Click on any POI marker (restaurants, shops, etc.) to view information
- Mouse cursor changes to pointer when hovering over clickable POIs
- Currently configured for the "label-amenity" layer

### 2. Information Popup
The popup displays available POI attributes including:
- 📍 **Name** (displayed prominently in bold)
- 📍 **Address** - Full address with house number, city, and postal code
- 🕒 **Opening Hours** - Formatted with Lithuanian day names (Pr, An, Tr, Kt, Pt, Št, Sk)
- 📞 **Phone** - Clickable telephone link
- ✉️ **Email** - Contact email
- 🌐 **Website** - Clickable external link
- 📖 **Wikipedia** - Link to Wikipedia article
- 🏛️ **Heritage** - Link to Lithuanian Cultural Heritage Register (KVR)
- 📏 **Height** - Building/structure height
- 💰 **Fee** - Fee information
- 🖼️ **Image** - Feature photo (if available)
- 🗄️ **OSM Link** - View feature on OpenStreetMap
- ✏️ **Edit Link** - Edit feature on OpenStreetMap

### 3. URL Deep Linking
**URL Format**: `#m/zoom/lat/lng/bearing/pitch/objectId`

**Example**: 
```
https://openmap.lt/#m/17.41/54.67863/25.28859/0/0/p2811970425
```

Where:
- `m` = map type
- `17.41` = zoom level
- `54.67863` = latitude
- `25.28859` = longitude
- `0` = bearing
- `0` = pitch
- `p2811970425` = object ID (p = layer code, 2811970425 = OSM feature ID)

**Behavior**:
- Clicking a POI adds its object ID to the URL
- Closing the popup removes the object ID
- Navigating to a URL with an object ID automatically shows the popup
- URL changes are saved to localStorage for persistence

### 4. Styling
- Clean, modern popup design
- Dark mode support that respects system preferences
- Responsive layout (max-width: 70vw for mobile)
- Smooth animations and transitions
- Custom close button styling

## Code Architecture

### Components Structure
```
src/
├── components/
│   └── PoiInteraction.tsx     # Main POI interaction component
├── libs/
│   ├── poiUtils.ts             # POI data formatting utilities
│   └── urlHash.ts              # URL hash parsing (extended)
└── app/
    ├── page.tsx                # Main map page (integrated component)
    └── globals.css             # Popup styles
```

### Component Breakdown

#### PoiInteraction.tsx
- Manages POI click events on the map
- Handles popup state and display
- Synchronizes object ID with URL
- Loads POI from direct URL links
- Changes cursor on hover

#### poiUtils.ts
- Formats POI attributes for display
- Translates opening hours to Lithuanian
- Generates OSM links
- Handles special attribute types (address, phone, links, etc.)
- Manages layer code mapping

#### urlHash.ts (Extended)
- Added optional `objectId` parameter to MapState interface
- Updated `parseHash()` to support 6 or 7 segments
- Updated `formatHash()` to include object ID when present

## Usage Example

### Špunka Restaurant (from issue)
1. Navigate to: `https://openmap.lt/#m/17.41/54.67863/25.28859/0/0`
2. Find and click on "Špunka" restaurant
3. URL changes to: `https://openmap.lt/#m/17.41/54.67863/25.28859/0/0/p2811970425`
4. Popup displays:
   - Name: Špunka
   - Address: Savičiaus g. 9, Vilnius
   - Opening hours (with Lithuanian day names)
   - Website link
   - OSM and Edit links

## Benefits

1. **User Experience**
   - Quick access to POI information without leaving the map
   - Shareable links to specific locations
   - Persistent state across sessions

2. **SEO & Sharing**
   - Deep links allow direct sharing of specific POIs
   - URLs are readable and semantic

3. **Developer Experience**
   - Clean separation of concerns
   - Reusable utility functions
   - Type-safe with TypeScript
   - Easy to extend with new layers

## Future Enhancements (Not in Scope)

Potential improvements for future iterations:
- Add more interactive layers (buildings, parks, etc.)
- Image gallery for POIs with multiple photos
- User reviews and ratings
- Route planning from POI
- Nearby POIs suggestion
- Search integration
- Multi-language support for attributes

## Testing

See `POI_TESTING.md` for detailed testing instructions and test cases.

## Security

✅ No security vulnerabilities detected by CodeQL
✅ Proper HTML escaping handled by React
✅ External links use `rel="noopener noreferrer"`
