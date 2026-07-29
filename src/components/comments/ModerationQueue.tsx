"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  approveCommentAction,
  type ModerationActionResult,
  rejectCommentAction,
} from "@/actions/comments";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { buildCommentPoiHref } from "@/lib/poiHelpers";

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
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [pendingId, setPendingId] = useState<number | null>(null);

  // Keeps this list in sync with the "Mano komentarai" list on the same
  // page: that list's own delete action can only refresh server data (via
  // router.refresh() below), which flows back here as a new initialItems
  // prop — plain useState wouldn't otherwise pick up that change.
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleModerate = async (
    id: number,
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
        setItems((current) => current.filter((item) => item.id !== id));
      }
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    router.refresh();
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
                onClick={() => handleModerate(item.id, approveCommentAction)}
              >
                Patvirtinti
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pendingId === item.id}
                onClick={() => handleModerate(item.id, rejectCommentAction)}
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
