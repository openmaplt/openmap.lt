import type { Metadata } from "next";
import { StatCard } from "@/components/dashboard/StatCard";
import { requireUser } from "@/lib/auth";
import { countPendingComments, listOwnComments } from "@/lib/comments";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Apžvalga - Openmap.lt",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const user = await requireUser("/paskyra");

  const canModerate = await currentUserHasPermission(
    PERMISSIONS.COMMENTS_MODERATE,
  );
  const [ownComments, pendingCount] = await Promise.all([
    listOwnComments(user.id),
    canModerate ? countPendingComments() : Promise.resolve(0),
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
        {canModerate && (
          <StatCard
            href="/paskyra/komentarai/tvirtinimas"
            label="Laukia patvirtinimo"
            count={pendingCount}
          />
        )}
      </div>
    </div>
  );
}
