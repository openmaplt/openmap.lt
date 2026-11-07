import type { Metadata } from "next";
import { StatCard } from "@/components/dashboard/StatCard";
import { requireUser } from "@/lib/auth";
import { countPendingComments, listOwnComments } from "@/lib/comments";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";
import { countPendingPhotos, listOwnPhotos } from "@/lib/photos";
import {
  countProfilesNeedingAttention,
  listUserProfiles,
} from "@/lib/userProfiles";

export const metadata: Metadata = {
  title: "Apžvalga - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const user = await requireUser("/paskyra");

  const [canModerateComments, canModeratePhotos, canModerateProfiles] =
    await Promise.all([
      currentUserHasPermission(PERMISSIONS.COMMENTS_MODERATE),
      currentUserHasPermission(PERMISSIONS.PHOTOS_MODERATE),
      currentUserHasPermission(PERMISSIONS.PROFILES_MODERATE),
    ]);
  const [
    ownComments,
    commentsPendingCount,
    ownPhotos,
    photosPendingCount,
    ownProfiles,
    profilesPendingCount,
  ] = await Promise.all([
    listOwnComments(user.id),
    canModerateComments ? countPendingComments() : Promise.resolve(0),
    listOwnPhotos(user.id),
    canModeratePhotos ? countPendingPhotos() : Promise.resolve(0),
    listUserProfiles(user.id),
    canModerateProfiles ? countProfilesNeedingAttention() : Promise.resolve(0),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">Apžvalga</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <StatCard
          href="/paskyra/komentarai"
          label="Mano komentarai"
          count={ownComments.length}
        />
        {canModerateComments && (
          <StatCard
            href="/paskyra/komentarai/tvirtinimas"
            label="Komentarai laukia patvirtinimo"
            count={commentsPendingCount}
          />
        )}
        <StatCard
          href="/paskyra/nuotraukos"
          label="Mano nuotraukos"
          count={ownPhotos.length}
        />
        {canModeratePhotos && (
          <StatCard
            href="/paskyra/nuotraukos/tvirtinimas"
            label="Nuotraukos laukia patvirtinimo"
            count={photosPendingCount}
          />
        )}
        <StatCard
          href="/paskyra/mano-profiliai"
          label="Mano profiliai"
          count={ownProfiles.length}
        />
        {canModerateProfiles && (
          <StatCard
            href="/paskyra/profiliai/valdymas?filter=attention"
            label="Profiliai laukia sprendimo"
            count={profilesPendingCount}
          />
        )}
      </div>
    </div>
  );
}
