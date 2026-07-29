"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS } from "@/config/nav";
import { cn } from "@/lib/utils";

interface NavigationProps {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}

const NAV_CLASSES = {
  desktop: "hidden md:flex items-center gap-1 text-sm font-medium",
  mobile: "space-y-1 px-4 py-6",
};

const LINK_CLASSES = {
  desktop:
    "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200",
  mobile:
    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all",
};

const ACTIVE_CLASSES = {
  desktop: "bg-secondary text-secondary-foreground font-semibold",
  mobile: "bg-secondary text-secondary-foreground",
};

const INACTIVE_CLASSES = {
  desktop: "text-muted-foreground hover:text-foreground hover:bg-accent/40",
  mobile: "text-muted-foreground hover:text-foreground hover:bg-accent/50",
};

const ICON_SIZE = {
  desktop: "size-4",
  mobile: "size-5",
};

export function Navigation({ variant, onNavigate }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={NAV_CLASSES[variant]}>
      {MENU_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={variant === "mobile" ? onNavigate : undefined}
            className={cn(
              LINK_CLASSES[variant],
              isActive ? ACTIVE_CLASSES[variant] : INACTIVE_CLASSES[variant],
            )}
          >
            <Icon className={ICON_SIZE[variant]} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
