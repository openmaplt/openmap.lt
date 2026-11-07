import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  type AdminProfileRow,
  hasChangedSinceApproval,
  parseAdminFilter,
  sortRows,
} from "@/components/dashboard/adminProfileRows";
import { ProfilesAdmin } from "@/components/dashboard/ProfilesAdmin";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";
import {
  listAllProfilesWithOwner,
  type ProfileWithOwner,
} from "@/lib/userProfiles";

export const metadata: Metadata = {
  title: "Naudotojų profiliai - Openmap.lt",
  robots: { index: false, follow: false },
};

const toRow = (profile: ProfileWithOwner): AdminProfileRow => ({
  id: profile.id,
  slug: profile.slug,
  name: profile.name,
  ownerName: profile.ownerName,
  ownerEmail: profile.ownerEmail,
  updatedAt: profile.updatedAt.toISOString(),
  approvedAt: profile.baseApprovedAt?.toISOString() ?? null,
  baseStatus: profile.baseStatus,
  moderationStatus: profile.moderationStatus,
  moderationNote: profile.moderationNote,
  changedSinceApproval: hasChangedSinceApproval(
    profile.updatedAt,
    profile.baseApprovedAt,
  ),
});

export default async function Page({
  searchParams,
}: PageProps<"/paskyra/profiliai/valdymas">) {
  const canModerate = await currentUserHasPermission(
    PERMISSIONS.PROFILES_MODERATE,
  );
  if (!canModerate) {
    redirect("/paskyra/profiliai");
  }

  const { filter } = await searchParams;
  const profiles = await listAllProfilesWithOwner();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Naudotojų profiliai
      </h1>
      <p className="max-w-3xl text-sm text-muted-foreground">
        Visi naudotojų sukurti profiliai yra vieši, žinant adresą. Čia galite
        juos peržiūrėti, patvirtinti kaip bazinius (tada juos mato visi
        lankytojai) arba paslėpti su komentaru: autorius jį mato, pataiso ir
        siūlo peržiūrai. Patvirtinti profiliai nėra tikrinami po kiekvieno
        pakeitimo, tačiau pakeisti po patvirtinimo pažymėti raudonai.
      </p>
      <ProfilesAdmin
        initialRows={sortRows(profiles.map(toRow))}
        initialFilter={parseAdminFilter(
          typeof filter === "string" ? filter : undefined,
        )}
      />
    </div>
  );
}
