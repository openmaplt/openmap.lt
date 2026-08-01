"use client";

import { LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";

interface AccountMenuItemsProps {
  onRequestCloseMenu: () => void;
}

export function AccountMenuItems({
  onRequestCloseMenu,
}: AccountMenuItemsProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <>
      <DropdownMenuLabel>{user.username ?? user.name}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild onSelect={onRequestCloseMenu}>
        <Link href="/paskyra">
          <LayoutDashboard className="size-4" />
          Valdymo skydas
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={logout}>
        <LogOut className="size-4" />
        Atsijungti
      </DropdownMenuItem>
    </>
  );
}
