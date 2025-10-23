# POI Click Functionality Testing Guide

## Overview
This document describes how to test the POI (Point of Interest) click functionality.

## Features Implemented

### 1. URL Hash with Object ID
- Format: `#m/zoom/lat/lng/bearing/pitch/objectId`
- Example: `https://openmap.lt/#m/17.41/54.67863/25.28859/0/0/p2811970425`
- The `p2811970425` is the object ID where:
  - `p` = layer code for "label-amenity"
  - `2811970425` = OSM feature ID

### 2. Interactive POI Layers
- Click on POI markers (currently "label-amenity" layer)
- Cursor changes to pointer on hover
- Shows popup with POI information

### 3. Popup Content
The popup displays various attributes when available:
- **Name** (bold)
- Official name
- Alternative names
- Address (with house number, city, postal code)
- Opening hours (translated to Lithuanian days)
- Email
- Phone (clickable tel: link)
- Website (clickable link)
- Heritage (link to KVR - Kultūros vertybių registras)
- Wikipedia (link to article)
- Height
- Fee
- Image
- OSM and Edit links

### 4. URL Synchronization
- Clicking a POI adds its ID to the URL
- Closing the popup removes the ID from URL
- Direct URL with object ID loads and shows the popup automatically
- URL changes are saved to localStorage

## Testing Instructions

### Test Case 1: Click on POI
1. Navigate to `https://openmap.lt/#m/17.41/54.67863/25.28859/0/0`
2. Find "Špunka" restaurant on the map
3. Click on it
4. Verify:
   - Popup appears with restaurant information
   - URL changes to include object ID (e.g., `/p2811970425`)
   - Cursor changes to pointer on hover

### Test Case 2: Direct URL with Object ID
1. Navigate to `https://openmap.lt/#m/17.41/54.67863/25.28859/0/0/p2811970425`
2. Verify:
   - Map loads at the correct location
   - Popup appears automatically showing Špunka restaurant
   - All information is displayed correctly

### Test Case 3: Close Popup
1. Open a POI popup (follow Test Case 1)
2. Click the X button to close
3. Verify:
   - Popup closes
   - Object ID is removed from URL
   - URL returns to format without object ID

### Test Case 4: Multiple POIs
1. Click on one POI
2. Click on another POI
3. Verify:
   - Previous popup closes
   - New popup opens
   - URL updates with new object ID

## Technical Details

### Components
- **PoiInteraction.tsx**: Main component handling POI clicks and popup display
- **poiUtils.ts**: Utility functions for formatting POI data
- **urlHash.ts**: Extended to support object ID parameter

### Styling
- Custom CSS in `globals.css` for popup appearance
- Dark mode support
- Responsive design (max-width: 70vw)

### Supported Layers
Currently configured for:
- `label-amenity` (layer code: `p`)
- `label-address` (layer code: `a`)

To add more layers, update the `LAYER_CODE` mapping in `poiUtils.ts`.

## Known Limitations
- Only works with vector tile features that have `id` and `__type__` properties
- Requires features to be rendered on the map (won't work if zoomed out too far)
- Initial object ID loading requires a small delay for map layers to be ready
