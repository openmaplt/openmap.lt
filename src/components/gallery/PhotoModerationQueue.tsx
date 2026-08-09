"use client";

import Link from "next/link";
import { useEffect } from "react";
import useSWR, { mutate } from "swr";
import {
  approvePhotoAction,
  type ModerationActionResult,
  rejectPhotoAction,
} from "@/actions/photos";
import { PendingCommentControls } from "@/components/comments/PendingCommentControls";
import { toast } from "@/components/ui/toast";
import { PHOTO_LICENSE_INFO, type PhotoLicense } from "@/config/photoLicenses";
import { buildCommentPoiHref } from "@/lib/poiHelpers";
import {
  OWN_PHOTOS_KEY,
  PENDING_PHOTOS_COUNT_KEY,
  PENDING_PHOTOS_KEY,
} from "@/lib/swrKeys";

export type PendingPhotoView = {
  id: number;
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
  fileName: string;
  license: PhotoLicense;
  createdAt: string;
  author: { username: string | null; name: string | null };
};

interface PhotoModerationQueueProps {
  initialItems: PendingPhotoView[];
}

export function PhotoModerationQueue({
  initialItems,
}: PhotoModerationQueueProps) {
  const { data: items = [] } = useSWR<PendingPhotoView[]>(
    PENDING_PHOTOS_KEY,
    null,
    { fallbackData: initialItems },
  );
  useEffect(() => {
    mutate(PENDING_PHOTOS_KEY, initialItems, { revalidate: false });
  }, [initialItems]);

  const removeFromQueue = (id: number) =>
    mutate<PendingPhotoView[]>(
      PENDING_PHOTOS_KEY,
      (current) => current?.filter((item) => item.id !== id),
      { revalidate: false },
    );

  const applyModerationResult = (
    id: number,
    result: ModerationActionResult,
    status: "approved" | "rejected",
    rejectionReason: string | null,
  ) => {
    if (!result.ok) {
      toast.error(
        result.error === "already_moderated"
          ? "Ši nuotrauka jau buvo apdorota."
          : "Nepavyko atlikti veiksmo.",
      );
      if (result.error === "already_moderated") {
        removeFromQueue(id);
      }
      return;
    }

    removeFromQueue(id);
    mutate<
      Array<{ id: number; status: string; rejectionReason: string | null }>
    >(
      OWN_PHOTOS_KEY,
      (current) =>
        current?.map((item) =>
          item.id === id ? { ...item, status, rejectionReason } : item,
        ),
      { revalidate: false },
    );
    mutate<number>(
      PENDING_PHOTOS_COUNT_KEY,
      (current) => Math.max((current ?? 1) - 1, 0),
      { revalidate: false },
    );
  };

  const handleApprove = async (id: number) => {
    const result = await approvePhotoAction(id);
    applyModerationResult(id, result, "approved", null);
  };

  const handleReject = async (id: number, reason: string) => {
    const result = await rejectPhotoAction(id, reason);
    applyModerationResult(id, result, "rejected", reason || null);
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nėra nuotraukų, laukiančių patvirtinimo.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map((item) => {
        const href = buildCommentPoiHref(item.mapProfileId, item.objectRef);
        const title = item.poiName || item.objectRef;
        return (
          <li
            key={item.id}
            className="rounded-md border border-border p-4 space-y-2"
          >
            {/* biome-ignore lint/performance/noImgElement: served from our own /api/photos route */}
            <img
              src={`/api/photos/${item.fileName}`}
              alt=""
              className="h-48 w-full rounded-md object-cover"
            />
            <div className="text-sm text-muted-foreground">
              {href ? (
                <Link href={href} className="hover:underline">
                  {title}
                </Link>
              ) : (
                title
              )}
              {" · "}
              {item.author.username ?? item.author.name ?? "Naudotojas"}
              {" · "}
              {PHOTO_LICENSE_INFO[item.license].label}
              {" · "}
              {new Date(item.createdAt).toLocaleString("lt-LT")}
            </div>
            <PendingCommentControls
              onApprove={() => handleApprove(item.id)}
              onReject={(reason) => handleReject(item.id, reason)}
            />
          </li>
        );
      })}
    </ul>
  );
}
