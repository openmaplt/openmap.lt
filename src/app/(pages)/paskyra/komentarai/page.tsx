import type { Metadata } from "next";
import { MyComments } from "@/components/comments/MyComments";
import { requireUser } from "@/lib/auth";
import { listOwnComments } from "@/lib/comments";

export const metadata: Metadata = {
  title: "Mano komentarai - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const user = await requireUser("/paskyra/komentarai");

  const ownComments = await listOwnComments(user.id);

  return (
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
          rejectionReason: comment.rejectionReason,
        }))}
      />
    </div>
  );
}
