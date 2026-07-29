"use client";

import useSWR from "swr";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchJson } from "@/lib/fetcher";

type ApprovedCommentView = {
  id: number;
  body: string;
  createdAt: string;
  author: {
    username: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
};

interface CommentsListProps {
  mapProfileId: string;
  objectRef: string;
}

export function CommentsList({ mapProfileId, objectRef }: CommentsListProps) {
  const params = new URLSearchParams({ profile: mapProfileId, ref: objectRef });
  const { data, isLoading } = useSWR<ApprovedCommentView[]>(
    `/api/comments?${params}`,
    fetchJson,
  );
  const comments = data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-12 rounded-md bg-muted animate-pulse" />
        <div className="h-12 rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Kol kas komentarų nėra.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => (
        <li key={comment.id} className="flex gap-2">
          <Avatar size="sm">
            <AvatarImage src={comment.author.avatarUrl ?? undefined} alt="" />
            <AvatarFallback>
              {(comment.author.username ?? comment.author.name ?? "?")
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground">
              {comment.author.username ?? comment.author.name ?? "Naudotojas"}
              {" · "}
              {new Date(comment.createdAt).toLocaleDateString("lt-LT")}
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {comment.body}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
