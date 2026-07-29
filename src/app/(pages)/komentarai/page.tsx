import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ModerationQueue } from "@/components/comments/ModerationQueue";
import { MyComments } from "@/components/comments/MyComments";
import { getCurrentUser } from "@/lib/auth";
import { listOwnComments, listPendingComments } from "@/lib/comments";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Komentarai - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/prisijungimas?returnTo=/komentarai");
  }

  const canModerate = await currentUserHasPermission(
    PERMISSIONS.COMMENTS_MODERATE,
  );
  const [pendingComments, ownComments] = await Promise.all([
    canModerate ? listPendingComments() : Promise.resolve([]),
    listOwnComments(user.id),
  ]);

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Mano komentarai
        </h1>
        <MyComments
          initialItems={ownComments.map((comment) => ({
            id: comment.id,
            mapProfileId: comment.mapProfileId,
            objectRef: comment.objectRef,
            poiName: comment.poiName,
            body: comment.body,
            status: comment.status,
            createdAt: comment.createdAt.toISOString(),
          }))}
        />
      </div>

      {canModerate && (
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold tracking-tight">
            Komentarų tvirtinimas
          </h2>
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
      )}
    </div>
  );
}
