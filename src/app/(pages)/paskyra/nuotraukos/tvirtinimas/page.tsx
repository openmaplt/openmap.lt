import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PhotoModerationQueue } from "@/components/gallery/PhotoModerationQueue";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";
import { listPendingPhotos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Nuotraukų tvirtinimas - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const canModerate = await currentUserHasPermission(
    PERMISSIONS.PHOTOS_MODERATE,
  );
  if (!canModerate) {
    redirect("/paskyra/nuotraukos");
  }

  const pendingPhotos = await listPendingPhotos();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Nuotraukų tvirtinimas
      </h1>
      <PhotoModerationQueue
        initialItems={pendingPhotos.map((photo) => ({
          id: photo.id,
          mapProfileId: photo.mapProfileId,
          objectRef: photo.objectRef,
          poiName: photo.poiName,
          fileName: photo.fileName,
          license: photo.license,
          createdAt: photo.createdAt.toISOString(),
          author: photo.author,
        }))}
      />
    </div>
  );
}
