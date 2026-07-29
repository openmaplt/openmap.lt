"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteOwnCommentAction } from "@/actions/comments";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { buildCommentPoiHref } from "@/lib/poiHelpers";

export type MyCommentView = {
  id: number;
  mapProfileId: string;
  objectRef: string;
  poiName: string | null;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const STATUS_LABEL: Record<MyCommentView["status"], string> = {
  pending: "Laukia",
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
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keeps this list in sync with "Komentarų tvirtinimas" on the same page:
  // that list's own approve/reject action can only refresh server data (via
  // router.refresh() below), which flows back here as a new initialItems
  // prop — plain useState wouldn't otherwise pick up that change.
  useEffect(() => {
    setItems(initialItems);
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

    setItems((current) => current.filter((item) => item.id !== id));
    router.refresh();
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
