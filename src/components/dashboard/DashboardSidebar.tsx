"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import useSWR, { mutate } from "swr";
import { CountBadge } from "@/components/ui/count-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DASHBOARD_MENU_ITEMS } from "@/config/dashboardNav";
import type { Permission } from "@/config/permissions";
import { PENDING_COUNT_KEY, PENDING_PHOTOS_COUNT_KEY } from "@/lib/swrKeys";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  permissions: Permission[];
  initialCommentsPendingCount: number;
  initialPhotosPendingCount: number;
}

export function DashboardSidebar({
  permissions,
  initialCommentsPendingCount,
  initialPhotosPendingCount,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const permissionSet = new Set(permissions);

  // Seeds the same SWR cache keys that ModerationQueue/MyComments (and their
  // photo equivalents) mutate on approve/reject/delete, so the sidebar badges
  // update live without a dedicated fetcher — see swrKeys.ts.
  useEffect(() => {
    mutate(PENDING_COUNT_KEY, initialCommentsPendingCount, {
      revalidate: false,
    });
  }, [initialCommentsPendingCount]);
  useEffect(() => {
    mutate(PENDING_PHOTOS_COUNT_KEY, initialPhotosPendingCount, {
      revalidate: false,
    });
  }, [initialPhotosPendingCount]);

  const { data: commentsPendingCount = 0 } = useSWR<number>(
    PENDING_COUNT_KEY,
    null,
    { fallbackData: initialCommentsPendingCount },
  );
  const { data: photosPendingCount = 0 } = useSWR<number>(
    PENDING_PHOTOS_COUNT_KEY,
    null,
    { fallbackData: initialPhotosPendingCount },
  );
  const pendingCounts = {
    comments: commentsPendingCount,
    photos: photosPendingCount,
  };

  const items = DASHBOARD_MENU_ITEMS.filter(
    (item) =>
      !item.requiredPermission || permissionSet.has(item.requiredPermission),
  );
  // "Administravimas" groups the moderation queues separately from personal
  // content — they act on everyone's comments/photos, not the viewer's own,
  // so nesting them under "Mano komentarai"/"Mano nuotraukos" would misread
  // as a filtered view of your own content. Only ever visible to the (small)
  // subset of users holding a moderation permission.
  const personalItems = items.filter((item) => item.section !== "admin");
  const adminItems = items.filter((item) => item.section === "admin");
  const badgeCountFor = (item: (typeof items)[number]) =>
    item.pendingCountKey ? pendingCounts[item.pendingCountKey] : 0;
  const totalPendingBadge = items.reduce(
    (sum, item) => sum + badgeCountFor(item),
    0,
  );

  const matches = (item: (typeof items)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);
  // Nested routes (e.g. /paskyra/komentarai/tvirtinimas) also match their
  // parent's prefix (/paskyra/komentarai) — pick the longest matching href so
  // only the most specific section highlights, not both at once.
  const current =
    items
      .filter(matches)
      .sort((a, b) => b.href.length - a.href.length)
      .at(0) ?? items[0];
  const CurrentIcon = current.icon;
  const isItemActive = (item: (typeof items)[number]) =>
    item.href === current.href;

  const renderMobileItem = (item: (typeof items)[number]) => {
    const Icon = item.icon;
    const isActive = isItemActive(item);
    const badgeCount = badgeCountFor(item);
    return (
      <DropdownMenuItem
        key={item.href}
        asChild
        className={cn(
          isActive && "bg-secondary text-secondary-foreground font-semibold",
        )}
      >
        <Link href={item.href}>
          <Icon className="size-4" />
          {item.label}
          {badgeCount > 0 && <CountBadge count={badgeCount} />}
        </Link>
      </DropdownMenuItem>
    );
  };

  const renderDesktopItem = (item: (typeof items)[number]) => {
    const Icon = item.icon;
    const isActive = isItemActive(item);
    const badgeCount = badgeCountFor(item);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-secondary text-secondary-foreground font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 min-w-0">{item.label}</span>
        {badgeCount > 0 && <CountBadge count={badgeCount} />}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile: current section collapses into a dropdown trigger so the
          nav never grows past one row, however many items get added later. */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-accent/40 transition-colors"
            >
              <span className="flex items-center gap-2">
                <CurrentIcon className="size-4" />
                {current.label}
              </span>
              <span className="flex items-center gap-2">
                {totalPendingBadge > 0 && (
                  <CountBadge count={totalPendingBadge} />
                )}
                <ChevronDown className="size-4 text-muted-foreground" />
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)]"
          >
            {personalItems.map(renderMobileItem)}
            {adminItems.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Administravimas</DropdownMenuLabel>
                {adminItems.map(renderMobileItem)}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop: full vertical nav column. */}
      <nav className="hidden md:flex md:flex-col gap-1 md:w-64 md:shrink-0">
        {personalItems.map(renderDesktopItem)}
        {adminItems.length > 0 && (
          <>
            <div className="my-2 border-t border-border" />
            <span className="px-3 text-xs font-semibold text-muted-foreground uppercase">
              Administravimas
            </span>
            {adminItems.map(renderDesktopItem)}
          </>
        )}
      </nav>
    </>
  );
}
