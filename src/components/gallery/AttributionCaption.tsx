import type { GalleryImage } from "./types";

/** Small "source · license" caption overlaid on a photo — every photo source
 * sets `attribution` (see GalleryImage), just with a plain source label
 * instead of a clickable license for OSM/STVK-sourced images, since we have
 * no per-photo license data for those. A `null` source means we don't have a
 * confident, displayable attribution (e.g. the uploader opted out of showing
 * their name) — render nothing rather than a misleading placeholder. */
export function AttributionCaption({ image }: { image: GalleryImage }) {
  if (!image.attribution) return null;
  const { source, license } = image.attribution;
  if (!source && !license) return null;

  return (
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center gap-2 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-[11px] text-white">
      {source && <span className="truncate">{source}</span>}
      {license && (
        <a
          href={license.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto ml-auto shrink-0 underline-offset-2 hover:underline"
        >
          {license.label}
        </a>
      )}
    </div>
  );
}
