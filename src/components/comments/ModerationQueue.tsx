"use client";

import Link from "next/link";
import { useEffect } from "react";
import useSWR, { mutate } from "swr";
import {
  approveCommentAction,
  type ModerationActionResult,
  rejectCommentAction,
} from "@/actions/comments";
import { PendingCommentControls } from "@/components/comments/PendingCommentControls";
import { toast } from "@/components/ui/toast";
import {
  COMMENT_STATUS,
  type ModeratedCommentStatus,
} from "@/domain/commentStatus";
import { buildCommentPoiHref, getMapProfileLabel } from "@/lib/poiHelpers";
import {
  OWN_COMMENTS_KEY,
  PENDING_COMMENTS_KEY,
  PENDING_COUNT_KEY,
} from "@/lib/swrKeys";

export type PendingCommentView = {
  id: number;
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
  body: string;
  createdAt: string;
  author: { username: string | null; name: string | null };
};

interface ModerationQueueProps {
  initialItems: PendingCommentView[];
}

export function ModerationQueue({ initialItems }: ModerationQueueProps) {
  const { data: items = [] } = useSWR<PendingCommentView[]>(
    PENDING_COMMENTS_KEY,
    null,
    { fallbackData: initialItems },
  );
  // fallbackData only covers what useSWR *returns* when the cache is empty —
  // it never writes into the cache itself. Without this, the first mutate()
  // call below would read `current` as undefined and wipe the list. Seeding
  // on mount makes each fresh page load (a real server refetch) the source
  // of truth, while mutate() during this mount keeps both lists in sync.
  useEffect(() => {
    mutate(PENDING_COMMENTS_KEY, initialItems, { revalidate: false });
  }, [initialItems]);

  const removeFromQueue = (id: number) =>
    mutate<PendingCommentView[]>(
      PENDING_COMMENTS_KEY,
      (current) => current?.filter((item) => item.id !== id),
      { revalidate: false },
    );

  const applyModerationResult = (
    id: number,
    result: ModerationActionResult,
    status: ModeratedCommentStatus,
    rejectionReason: string | null,
  ) => {
    if (!result.ok) {
      toast.error(
        result.error === "already_moderated"
          ? "Šis komentaras jau buvo apdorotas."
          : "Nepavyko atlikti veiksmo.",
      );
      if (result.error === "already_moderated") {
        removeFromQueue(id);
      }
      return;
    }

    removeFromQueue(id);
    // Reflect the new status on "Mano komentarai" if the author has it open.
    mutate<
      Array<{ id: number; status: string; rejectionReason: string | null }>
    >(
      OWN_COMMENTS_KEY,
      (current) =>
        current?.map((item) =>
          item.id === id ? { ...item, status, rejectionReason } : item,
        ),
      { revalidate: false },
    );
    mutate<number>(
      PENDING_COUNT_KEY,
      (current) => Math.max((current ?? 1) - 1, 0),
      { revalidate: false },
    );
  };

  const handleApprove = async (id: number) => {
    const result = await approveCommentAction(id);
    applyModerationResult(id, result, COMMENT_STATUS.APPROVED, null);
  };

  const handleReject = async (id: number, reason: string) => {
    const result = await rejectCommentAction(id, reason);
    applyModerationResult(id, result, COMMENT_STATUS.REJECTED, reason || null);
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nėra komentarų, laukiančių patvirtinimo.
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
                {getMapProfileLabel(item.mapProfileId)}
                {" · "}
                {item.author.username ?? item.author.name ?? "Naudotojas"}
                {" · "}
                {new Date(item.createdAt).toLocaleString("lt-LT")}
              </div>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {item.body}
            </p>
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
