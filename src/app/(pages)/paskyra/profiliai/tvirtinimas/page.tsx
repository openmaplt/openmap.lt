import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BaseProfileRequests } from "@/components/dashboard/BaseProfileRequests";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";
import { listRequestedProfiles } from "@/lib/userProfiles";

export const metadata: Metadata = {
  title: "Profilių tvirtinimas - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const canModerate = await currentUserHasPermission(
    PERMISSIONS.PROFILES_MODERATE,
  );
  if (!canModerate) {
    redirect("/paskyra/profiliai");
  }

  const requested = await listRequestedProfiles();

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-extrabold tracking-tight">
        Profilių tvirtinimas
      </h1>
      <p className="max-w-xl text-sm text-muted-foreground">
        Naudotojai siūlo viešus savo profilius kaip bazinius. Patvirtintą
        profilį mato visi lankytojai profilių pasirinkimo valdiklyje.
      </p>
      <BaseProfileRequests
        initialRequests={requested.map((profile) => ({
          id: profile.id,
          slug: profile.slug,
          name: profile.name,
          ownerName: profile.ownerName,
        }))}
      />
    </div>
  );
}
