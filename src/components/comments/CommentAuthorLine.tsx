import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type CommentView = {
  id: number;
  body: string;
  createdAt: string;
  author: {
    username: string | null;
    name: string | null;
    avatarUrl: string | null;
  };
};

export function CommentAuthorLine({ comment }: { comment: CommentView }) {
  return (
    <div className="flex gap-2">
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
    </div>
  );
}
