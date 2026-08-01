import type React from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { requireUser } from "@/lib/auth";
import { countPendingComments } from "@/lib/comments";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("/paskyra");

  const canModerate = await currentUserHasPermission(
    PERMISSIONS.COMMENTS_MODERATE,
  );
  const pendingCount = canModerate ? await countPendingComments() : 0;

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      <div className="md:border-r md:border-border md:pr-8">
        <DashboardSidebar
          canModerate={canModerate}
          initialPendingCount={pendingCount}
        />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
