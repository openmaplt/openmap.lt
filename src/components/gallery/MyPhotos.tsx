"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import {
  deleteOwnPhotoAction,
  updatePhotoShowAuthorAction,
} from "@/actions/photos";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { PHOTO_LICENSE_INFO, type PhotoLicense } from "@/config/photoLicenses";
import { buildCommentPoiHref } from "@/lib/poiHelpers";
import {
  OWN_PHOTOS_KEY,
  PENDING_PHOTOS_COUNT_KEY,
  PENDING_PHOTOS_KEY,
} from "@/lib/swrKeys";

export type MyPhotoView = {
  id: number;
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
  fileName: string;
  license: PhotoLicense;
  showAuthor: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  rejectionReason: string | null;
};

const STATUS_LABEL: Record<MyPhotoView["status"], string> = {
  pending: "Laukiama patvirtinimo",
  approved: "Patvirtinta",
  rejected: "Atmesta",
};

const STATUS_CLASS: Record<MyPhotoView["status"], string> = {
  pending: "bg-muted text-muted-foreground",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
};

interface MyPhotosProps {
  initialItems: MyPhotoView[];
}

export function MyPhotos({ initialItems }: MyPhotosProps) {
  const { data: items = [] } = useSWR<MyPhotoView[]>(OWN_PHOTOS_KEY, null, {
    fallbackData: initialItems,
  });
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mutate(OWN_PHOTOS_KEY, initialItems, { revalidate: false });
  }, [initialItems]);

  useEffect(() => {
    return () => {
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (confirmingId !== id) {
      setConfirmingId(id);
      if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
      confirmTimeoutRef.current = setTimeout(() => setConfirmingId(null), 4000);
      return;
    }

    if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
    setDeletingId(id);
    const result = await deleteOwnPhotoAction(id);
    setDeletingId(null);
    setConfirmingId(null);

    if (!result.ok) {
      toast.error("Nepavyko ištrinti nuotraukos.");
      return;
    }

    const deletedItem = items.find((item) => item.id === id);

    mutate<MyPhotoView[]>(
      OWN_PHOTOS_KEY,
      (current) => current?.filter((item) => item.id !== id),
      { revalidate: false },
    );
    mutate<Array<{ id: number }>>(
      PENDING_PHOTOS_KEY,
      (current) => current?.filter((item) => item.id !== id),
      { revalidate: false },
    );
    if (deletedItem?.status === "pending") {
      mutate<number>(
        PENDING_PHOTOS_COUNT_KEY,
        (current) => Math.max((current ?? 1) - 1, 0),
        { revalidate: false },
      );
    }
  };

  const handleToggleShowAuthor = async (id: number, showAuthor: boolean) => {
    // Optimistic — this is just a display preference, not worth a loading
    // state; revert if the server call fails.
    mutate<MyPhotoView[]>(
      OWN_PHOTOS_KEY,
      (current) =>
        current?.map((item) =>
          item.id === id ? { ...item, showAuthor } : item,
        ),
      { revalidate: false },
    );

    const result = await updatePhotoShowAuthorAction(id, showAuthor);
    if (!result.ok) {
      toast.error("Nepavyko atnaujinti nustatymo.");
      mutate<MyPhotoView[]>(
        OWN_PHOTOS_KEY,
        (current) =>
          current?.map((item) =>
            item.id === id ? { ...item, showAuthor: !showAuthor } : item,
          ),
        { revalidate: false },
      );
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Jūs dar neįkėlėte nuotraukų.
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
              className="h-40 w-full rounded-md object-cover"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground truncate">
                {href ? (
                  <Link href={href} className="hover:underline">
                    {title}
                  </Link>
                ) : (
                  title
                )}
              </div>
              <span
                className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLASS[item.status]}`}
              >
                {STATUS_LABEL[item.status]}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {PHOTO_LICENSE_INFO[item.license].label}
              {" · "}
              {new Date(item.createdAt).toLocaleDateString("lt-LT")}
            </div>
            {item.status === "rejected" && item.rejectionReason && (
              <p className="text-xs text-muted-foreground italic">
                Priežastis: {item.rejectionReason}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id={`show-author-${item.id}`}
                checked={item.showAuthor}
                onCheckedChange={(checked) =>
                  handleToggleShowAuthor(item.id, checked === true)
                }
              />
              <Label htmlFor={`show-author-${item.id}`} className="font-normal">
                Rodyti mano naudotojo vardą
              </Label>
            </div>
            <Button
              type="button"
              size="sm"
              variant={confirmingId === item.id ? "destructive" : "outline"}
              disabled={deletingId === item.id}
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 className="size-4" />
              {confirmingId === item.id ? "Patvirtinti ištrinimą?" : "Ištrinti"}
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
