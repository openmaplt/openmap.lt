import type React from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import type { Permission } from "@/config/permissions";
import { requireUser } from "@/lib/auth";
import { countPendingComments } from "@/lib/comments";
import { currentUserHasPermission, PERMISSIONS } from "@/lib/permissions";
import { countPendingPhotos } from "@/lib/photos";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("/paskyra");

  const [canModerateComments, canModeratePhotos] = await Promise.all([
    currentUserHasPermission(PERMISSIONS.COMMENTS_MODERATE),
    currentUserHasPermission(PERMISSIONS.PHOTOS_MODERATE),
  ]);
  const [commentsPendingCount, photosPendingCount] = await Promise.all([
    canModerateComments ? countPendingComments() : Promise.resolve(0),
    canModeratePhotos ? countPendingPhotos() : Promise.resolve(0),
  ]);

  const permissions: Permission[] = [
    ...(canModerateComments ? [PERMISSIONS.COMMENTS_MODERATE] : []),
    ...(canModeratePhotos ? [PERMISSIONS.PHOTOS_MODERATE] : []),
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      <div className="md:border-r md:border-border md:pr-8">
        <DashboardSidebar
          permissions={permissions}
          initialCommentsPendingCount={commentsPendingCount}
          initialPhotosPendingCount={photosPendingCount}
        />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
