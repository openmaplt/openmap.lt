"use client";

import { useState } from "react";
import { AccountLinksDialog } from "@/components/account/AccountLinksDialog";
import { AccountMenuItems } from "@/components/account/AccountMenuItems";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";

export function AccountMenu() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountLinksOpen, setAccountLinksOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon-lg"
            className="rounded-full p-0 shadow-xl"
            aria-label="Paskyra"
          >
            <Avatar className="size-9">
              <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
              <AvatarFallback>
                {(user.username ?? user.name ?? "?").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <AccountMenuItems
            onRequestCloseMenu={() => setMenuOpen(false)}
            onOpenAccountLinks={() => setAccountLinksOpen(true)}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <AccountLinksDialog
        open={accountLinksOpen}
        onOpenChange={setAccountLinksOpen}
      />
    </>
  );
}
