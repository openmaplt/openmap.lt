export interface GalleryImage {
  url: string;
  name?: string;
  // Shown as a caption overlay when present — every photo source sets this,
  // just with different content: a user upload's chosen username (or null if
  // they opted out) + the license they picked, vs. a fixed source label
  // ("STVK") for external photos we have no per-photo license data for, vs.
  // null when we don't actually know the source (e.g. OSM `image` tag — see
  // PoiPhotoGallery / ProtectedPhotos / PoiDetails). A null source renders no
  // caption at all rather than a placeholder.
  attribution?: {
    source: string | null;
    // Only present when we actually know the license (currently: our own
    // user uploads) — external sources render just the source label.
    license?: { label: string; url: string };
  };
}
