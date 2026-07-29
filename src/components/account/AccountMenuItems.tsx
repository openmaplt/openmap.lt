"use client";

import { LogOut, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";

interface AccountMenuItemsProps {
  onRequestCloseMenu: () => void;
  onOpenAccountLinks: () => void;
}

export function AccountMenuItems({
  onRequestCloseMenu,
  onOpenAccountLinks,
}: AccountMenuItemsProps) {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <>
      <DropdownMenuLabel>{user.username ?? user.name}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild onSelect={onRequestCloseMenu}>
        <Link href="/komentarai">
          <MessageSquare className="size-4" />
          Mano komentarai
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem
        onSelect={() => {
          onRequestCloseMenu();
          // Defer past the DropdownMenu's own close/focus teardown — opening
          // the Dialog in the same tick races with it and gets dismissed
          // immediately (Radix DropdownMenu + Dialog interaction quirk).
          setTimeout(onOpenAccountLinks, 0);
        }}
      >
        <Settings className="size-4" />
        Tvarkyti prisijungimus
      </DropdownMenuItem>
      <DropdownMenuItem onSelect={logout}>
        <LogOut className="size-4" />
        Atsijungti
      </DropdownMenuItem>
    </>
  );
}
