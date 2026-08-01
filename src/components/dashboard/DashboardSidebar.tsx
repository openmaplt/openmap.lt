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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DASHBOARD_MENU_ITEMS } from "@/config/dashboardNav";
import { PENDING_COUNT_KEY } from "@/lib/swrKeys";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  canModerate: boolean;
  initialPendingCount: number;
}

export function DashboardSidebar({
  canModerate,
  initialPendingCount,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  // Seeds the same SWR cache key that ModerationQueue/MyComments mutate on
  // approve/reject/delete, so the sidebar badge updates live without a
  // dedicated fetcher — see swrKeys.ts for the cross-component contract.
  useEffect(() => {
    mutate(PENDING_COUNT_KEY, initialPendingCount, { revalidate: false });
  }, [initialPendingCount]);

  const { data: pendingCount = 0 } = useSWR<number>(PENDING_COUNT_KEY, null, {
    fallbackData: initialPendingCount,
  });

  const items = DASHBOARD_MENU_ITEMS.filter(
    (item) => !item.requiresModerate || canModerate,
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
                {pendingCount > 0 && canModerate && (
                  <CountBadge count={pendingCount} />
                )}
                <ChevronDown className="size-4 text-muted-foreground" />
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)]"
          >
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item);
              const showBadge = item.requiresModerate && pendingCount > 0;
              return (
                <DropdownMenuItem
                  key={item.href}
                  asChild
                  className={cn(
                    isActive &&
                      "bg-secondary text-secondary-foreground font-semibold",
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="size-4" />
                    {item.label}
                    {showBadge && <CountBadge count={pendingCount} />}
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop: full vertical nav column. */}
      <nav className="hidden md:flex md:flex-col gap-1 md:w-64 md:shrink-0">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);
          const showBadge = item.requiresModerate && pendingCount > 0;
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
              {showBadge && <CountBadge count={pendingCount} />}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
