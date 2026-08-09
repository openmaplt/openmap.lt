"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR, { mutate } from "swr";
import {
  approvePhotoAction,
  rejectPhotoAction,
  type UploadedPhoto,
} from "@/actions/photos";
import { PendingCommentControls } from "@/components/comments/PendingCommentControls";
import { PHOTO_LICENSE_INFO, type PhotoLicense } from "@/config/photoLicenses";
import { fetchJson } from "@/lib/fetcher";
import { buildPhotosApiUrl } from "@/lib/poiHelpers";
import { useAuth } from "@/providers/AuthProvider";
import { ImageGallery } from "./ImageGallery";
import { PhotoUploadDialog } from "./PhotoUploadDialog";
import type { GalleryImage } from "./types";

type PhotoView = {
  id: number;
  fileName: string;
  license: PhotoLicense;
  author: { username: string | null; name: string | null } | null;
};

type PhotosResponse = { approved: PhotoView[]; pending: PhotoView[] };

interface PoiPhotoGalleryProps {
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
  // Photos from a source other than our own DB — the POI's OSM `image` tag
  // (as a single-item array) or STVK protected-area photos. Always combined
  // with our own approved uploads into one gallery — see ProtectedPhotos.tsx
  // and PoiDetails.tsx for the two call sites.
  externalImages?: GalleryImage[];
}

function toGalleryImage(
  photo: PhotoView,
  poiName: string | null,
): GalleryImage {
  const info = PHOTO_LICENSE_INFO[photo.license];
  return {
    url: `/api/photos/${photo.fileName}`,
    // Alt text is the SEO signal that actually matters for image search —
    // the on-disk fileName (a UUID) deliberately isn't, so it stays opaque.
    name: poiName ? `${poiName} – nuotrauka` : "Naudotojo įkelta nuotrauka",
    attribution: {
      source: photo.author
        ? (photo.author.username ?? photo.author.name)
        : null,
      license: { label: info.label, url: info.url },
    },
  };
}

/**
 * Every POI's photo area, whatever the source: the OSM `image` tag, STVK
 * protected-area photos, and user-uploaded photos are always merged into a
 * single ImageGallery — see the plan discussion for why this isn't three
 * separate galleries. Always renders (even with zero photos) so the upload
 * CTA is the one way user-uploaded photos come to exist at all.
 */
export function PoiPhotoGallery({
  mapProfileId,
  objectRef,
  poiName,
  externalImages = [],
}: PoiPhotoGalleryProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const key = buildPhotosApiUrl(mapProfileId, objectRef);
  const { data } = useSWR<PhotosResponse>(key, fetchJson);
  const approved = data?.approved ?? [];
  const pending = data?.pending ?? [];

  const images: GalleryImage[] = [
    ...externalImages,
    ...approved.map((photo) => toGalleryImage(photo, poiName)),
  ];

  const removePending = (id: number) =>
    mutate<PhotosResponse>(
      key,
      (current) =>
        current && {
          ...current,
          pending: current.pending.filter((item) => item.id !== id),
        },
      { revalidate: false },
    );

  const handleApprove = async (id: number) => {
    const result = await approvePhotoAction(id);
    if (!result.ok) return;
    mutate(key);
  };

  const handleReject = async (id: number, reason: string) => {
    const result = await rejectPhotoAction(id, reason);
    if (!result.ok) return;
    removePending(id);
  };

  const handleUploaded = (_uploaded: UploadedPhoto[]) => {
    mutate(key);
  };

  return (
    <div className="space-y-3 px-4 pt-1 pb-4">
      {images.length > 0 ? (
        <ImageGallery images={images} />
      ) : (
        <p className="text-sm text-muted-foreground">Kol kas nuotraukų nėra.</p>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            Laukia patvirtinimo
          </h4>
          <ul className="space-y-3">
            {pending.map((photo) => (
              <li
                key={photo.id}
                className="rounded-md border border-border p-3 space-y-2"
              >
                {/* biome-ignore lint/performance/noImgElement: served from our own /api/photos route, not next/image-friendly remote host */}
                <img
                  src={`/api/photos/${photo.fileName}`}
                  alt=""
                  className="h-32 w-full rounded-md object-cover"
                />
                <PendingCommentControls
                  onApprove={() => handleApprove(photo.id)}
                  onReject={(reason) => handleReject(photo.id, reason)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {user ? (
        <PhotoUploadDialog
          mapProfileId={mapProfileId}
          objectRef={objectRef}
          poiName={poiName}
          onUploaded={handleUploaded}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Norėdami įkelti nuotrauką,{" "}
          <Link
            href={`/prisijungimas?returnTo=${encodeURIComponent(pathname)}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            prisijunkite
          </Link>
          .
        </p>
      )}
    </div>
  );
}
