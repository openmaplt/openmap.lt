"use client";

import useSWR, { mutate } from "swr";
import { approveCommentAction, rejectCommentAction } from "@/actions/comments";
import {
  CommentAuthorLine,
  type CommentView,
} from "@/components/comments/CommentAuthorLine";
import { PendingCommentControls } from "@/components/comments/PendingCommentControls";
import { fetchJson } from "@/lib/fetcher";
import { buildCommentsApiUrl } from "@/lib/poiHelpers";
import { PENDING_COUNT_KEY } from "@/lib/swrKeys";

type CommentsResponse = {
  approved: CommentView[];
  // Only populated for viewers with comments.moderate — an empty array here
  // is indistinguishable from "no permission", which is intentional: the UI
  // just renders whatever the server decided to send.
  pending: CommentView[];
};

interface CommentsListProps {
  mapProfileId: string;
  objectRef: string;
}

export function CommentsList({ mapProfileId, objectRef }: CommentsListProps) {
  const key = buildCommentsApiUrl(mapProfileId, objectRef);
  const { data, isLoading } = useSWR<CommentsResponse>(key, fetchJson);
  const approved = data?.approved ?? [];
  const pending = data?.pending ?? [];

  const removePending = (id: number) =>
    mutate<CommentsResponse>(
      key,
      (current) =>
        current && {
          ...current,
          pending: current.pending.filter((item) => item.id !== id),
        },
      { revalidate: false },
    );

  const decPendingCount = () =>
    mutate<number>(
      PENDING_COUNT_KEY,
      (current) => Math.max((current ?? 1) - 1, 0),
      { revalidate: false },
    );

  const handleApprove = async (id: number) => {
    const result = await approveCommentAction(id);
    if (!result.ok) return;
    // The now-approved comment belongs at the end of the approved list, but
    // refetching is simpler and cheap than reconciling ordering client-side.
    mutate(key);
    decPendingCount();
  };

  const handleReject = async (id: number, reason: string) => {
    const result = await rejectCommentAction(id, reason);
    if (!result.ok) return;
    removePending(id);
    decPendingCount();
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-12 rounded-md bg-muted animate-pulse" />
        <div className="h-12 rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  if (approved.length === 0 && pending.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Kol kas komentarų nėra.</p>
    );
  }

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase">
            Laukia patvirtinimo
          </h4>
          <ul className="space-y-3">
            {pending.map((comment) => (
              <li
                key={comment.id}
                className="rounded-md border border-border p-3 space-y-2"
              >
                <CommentAuthorLine comment={comment} />
                <PendingCommentControls
                  onApprove={() => handleApprove(comment.id)}
                  onReject={(reason) => handleReject(comment.id, reason)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
      {approved.length > 0 && (
        <ul className="space-y-3">
          {approved.map((comment) => (
            <li key={comment.id}>
              <CommentAuthorLine comment={comment} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
