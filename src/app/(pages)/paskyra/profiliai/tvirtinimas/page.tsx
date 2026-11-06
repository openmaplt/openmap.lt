import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  type AdminProfileRow,
  hasChangedSinceApproval,
  sortApprovedRows,
} from "@/components/dashboard/adminProfileRows";
import { BaseProfilesAdmin } from "@/components/dashboard/BaseProfileRequests";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";
import {
  listApprovedProfilesWithOwner,
  listRequestedProfiles,
  type ProfileWithOwner,
} from "@/lib/userProfiles";

export const metadata: Metadata = {
  title: "Profilių tvirtinimas - Openmap.lt",
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
  changedSinceApproval: hasChangedSinceApproval(
    profile.updatedAt,
    profile.baseApprovedAt,
  ),
});

export default async function Page() {
  const canModerate = await currentUserHasPermission(
    PERMISSIONS.PROFILES_MODERATE,
  );
  if (!canModerate) {
    redirect("/paskyra/profiliai");
  }

  const [requested, approved] = await Promise.all([
    listRequestedProfiles(),
    listApprovedProfilesWithOwner(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Profilių tvirtinimas
      </h1>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Naudotojai siūlo viešus savo profilius kaip bazinius. Patvirtintą
        profilį mato visi lankytojai profilių pasirinkimo valdiklyje.
      </p>
      <BaseProfilesAdmin
        initialRequests={requested.map(toRow)}
        initialApproved={sortApprovedRows(approved.map(toRow))}
      />
    </div>
  );
}
