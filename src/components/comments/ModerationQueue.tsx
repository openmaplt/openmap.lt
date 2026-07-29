"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import {
  approveCommentAction,
  type ModerationActionResult,
  rejectCommentAction,
} from "@/actions/comments";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { buildCommentPoiHref } from "@/lib/poiHelpers";
import { OWN_COMMENTS_KEY, PENDING_COMMENTS_KEY } from "@/lib/swrKeys";

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
  const [pendingId, setPendingId] = useState<number | null>(null);

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

  const handleModerate = async (
    id: number,
    status: "approved" | "rejected",
    action: (id: number) => Promise<ModerationActionResult>,
  ) => {
    setPendingId(id);
    const result = await action(id);
    setPendingId(null);

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
    mutate<Array<{ id: number; status: string }>>(
      OWN_COMMENTS_KEY,
      (current) =>
        current?.map((item) => (item.id === id ? { ...item, status } : item)),
      { revalidate: false },
    );
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
                {item.author.username ?? item.author.name ?? "Naudotojas"}
                {" · "}
                {new Date(item.createdAt).toLocaleString("lt-LT")}
              </div>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {item.body}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                disabled={pendingId === item.id}
                onClick={() =>
                  handleModerate(item.id, "approved", approveCommentAction)
                }
              >
                Patvirtinti
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pendingId === item.id}
                onClick={() =>
                  handleModerate(item.id, "rejected", rejectCommentAction)
                }
              >
                Atmesti
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
