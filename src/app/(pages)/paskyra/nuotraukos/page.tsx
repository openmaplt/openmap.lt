import type { Metadata } from "next";
import { MyPhotos } from "@/components/gallery/MyPhotos";
import { requireUser } from "@/lib/auth";
import { listOwnPhotos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Mano nuotraukos - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const user = await requireUser("/paskyra/nuotraukos");

  const ownPhotos = await listOwnPhotos(user.id);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Mano nuotraukos
      </h1>
      <MyPhotos
        initialItems={ownPhotos.map((photo) => ({
          id: photo.id,
          mapProfileId: photo.mapProfileId,
          objectRef: photo.objectRef,
          poiName: photo.poiName,
          fileName: photo.fileName,
          license: photo.license,
          showAuthor: photo.showAuthor,
          status: photo.status,
          createdAt: photo.createdAt.toISOString(),
          rejectionReason: photo.rejectionReason,
        }))}
      />
    </div>
  );
}
