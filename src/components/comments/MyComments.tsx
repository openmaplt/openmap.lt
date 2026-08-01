"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import useSWR, { mutate } from "swr";
import { deleteOwnCommentAction } from "@/actions/comments";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { buildCommentPoiHref } from "@/lib/poiHelpers";
import {
  OWN_COMMENTS_KEY,
  PENDING_COMMENTS_KEY,
  PENDING_COUNT_KEY,
} from "@/lib/swrKeys";

export type MyCommentView = {
  id: number;
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  rejectionReason: string | null;
};

const STATUS_LABEL: Record<MyCommentView["status"], string> = {
  pending: "Laukiama patvirtinimo",
  approved: "Patvirtinta",
  rejected: "Atmesta",
};

const STATUS_CLASS: Record<MyCommentView["status"], string> = {
  pending: "bg-muted text-muted-foreground",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
};

interface MyCommentsProps {
  initialItems: MyCommentView[];
}

export function MyComments({ initialItems }: MyCommentsProps) {
  const { data: items = [] } = useSWR<MyCommentView[]>(OWN_COMMENTS_KEY, null, {
    fallbackData: initialItems,
  });
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // fallbackData only covers what useSWR *returns* when the cache is empty —
  // it never writes into the cache itself. Without this, the first mutate()
  // call below would read `current` as undefined and wipe the list. Seeding
  // on mount makes each fresh page load (a real server refetch) the source
  // of truth, while mutate() during this mount keeps both lists in sync.
  useEffect(() => {
    mutate(OWN_COMMENTS_KEY, initialItems, { revalidate: false });
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
    const result = await deleteOwnCommentAction(id);
    setDeletingId(null);
    setConfirmingId(null);

    if (!result.ok) {
      toast.error("Nepavyko ištrinti komentaro.");
      return;
    }

    const deletedItem = items.find((item) => item.id === id);

    mutate<MyCommentView[]>(
      OWN_COMMENTS_KEY,
      (current) => current?.filter((item) => item.id !== id),
      { revalidate: false },
    );
    // The deleted comment might still be sitting in the moderation queue
    // (e.g. a moderator deleting their own pending comment).
    mutate<Array<{ id: number }>>(
      PENDING_COMMENTS_KEY,
      (current) => current?.filter((item) => item.id !== id),
      { revalidate: false },
    );
    if (deletedItem?.status === "pending") {
      mutate<number>(
        PENDING_COUNT_KEY,
        (current) => Math.max((current ?? 1) - 1, 0),
        { revalidate: false },
      );
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Jūs dar neparašėte komentarų.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const href = buildCommentPoiHref(item.mapProfileId, item.objectRef);
        const title = item.poiName || item.objectRef;
        return (
          <li
            key={item.id}
            className="rounded-md border border-border p-4 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground">
                {href ? (
                  <Link href={href} className="hover:underline">
                    {title}
                  </Link>
                ) : (
                  title
                )}
                {" · "}
                {new Date(item.createdAt).toLocaleDateString("lt-LT")}
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CLASS[item.status]}`}
              >
                {STATUS_LABEL[item.status]}
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {item.body}
            </p>
            {item.status === "rejected" && item.rejectionReason && (
              <p className="text-xs text-muted-foreground italic">
                Priežastis: {item.rejectionReason}
              </p>
            )}
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
