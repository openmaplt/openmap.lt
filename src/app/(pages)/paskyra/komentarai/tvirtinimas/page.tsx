import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ModerationQueue } from "@/components/comments/ModerationQueue";
import { listPendingComments } from "@/lib/comments";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Komentarų tvirtinimas - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const canModerate = await currentUserHasPermission(
    PERMISSIONS.COMMENTS_MODERATE,
  );
  if (!canModerate) {
    redirect("/paskyra/komentarai");
  }

  const pendingComments = await listPendingComments();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Komentarų tvirtinimas
      </h1>
      <ModerationQueue
        initialItems={pendingComments.map((comment) => ({
          id: comment.id,
          mapProfileId: comment.mapProfileId,
          objectRef: comment.objectRef,
          poiName: comment.poiName,
          body: comment.body,
          createdAt: comment.createdAt.toISOString(),
          author: comment.author,
        }))}
      />
    </div>
  );
}
