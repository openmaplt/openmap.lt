import type { GalleryImage } from "./types";

/** Small "source · license" caption overlaid on a photo — every photo source
 * sets `attribution` (see GalleryImage), just with a plain source label
 * instead of a clickable license for OSM/STVK-sourced images, since we have
 * no per-photo license data for those. */
export function AttributionCaption({ image }: { image: GalleryImage }) {
  if (!image.attribution) return null;
  const { source, license } = image.attribution;

  return (
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-[11px] text-white">
      <span className="truncate">{source ?? "Anonimas"}</span>
      {license && (
        <a
          href={license.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto shrink-0 underline-offset-2 hover:underline"
        >
          {license.label}
        </a>
      )}
    </div>
  );
}
