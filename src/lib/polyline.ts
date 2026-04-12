/**
 * Decodes a polyline encoded string into an array of coordinates.
 * GraphHopper uses 5 decimal places by default.
 * Adapted from: https://github.com/graphhopper/directions-api-js-client/blob/master/src/GHUtil.js
 */
export function decodePolyline(
  encoded: string,
  is3D: boolean = false,
): [number, number][] {
  const inv = 1e5;
  const decoded: [number, number][] = [];
  let lat = 0;
  let lon = 0;
  let elev = 0;
  let index = 0;
  const len = encoded.length;

  while (index < len) {
    // Latitude
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    // Longitude
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLon = result & 1 ? ~(result >> 1) : result >> 1;
    lon += deltaLon;

    if (is3D) {
      // Elevation
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const deltaElev = result & 1 ? ~(result >> 1) : result >> 1;
      elev += deltaElev;
      // We currently don't use elevation in the map, so we just skip it or store it if needed
      // decoded.push([lon / inv, lat / inv, elev / 100]);
    }

    decoded.push([lon / inv, lat / inv]);
  }

  return decoded;
}
