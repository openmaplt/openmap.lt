"use client";

import { CircleQuestionMark, LogIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AccountLinksDialog } from "@/components/account/AccountLinksDialog";
import { AccountMenuItems } from "@/components/account/AccountMenuItems";
import { LoginChoiceButtons } from "@/components/auth/LoginChoiceButtons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MENU_ITEMS } from "@/config/nav";
import { useAuth } from "@/providers/AuthProvider";

export function HelpButton() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [accountLinksOpen, setAccountLinksOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Meniu"
            className="fixed bottom-24 sm:bottom-20 left-3 z-10 flex size-10 items-center justify-center rounded-lg border border-input bg-white shadow-xl transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
          >
            <CircleQuestionMark className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="top"
          className="w-60"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DropdownMenuLabel className="flex items-center gap-2 font-normal text-muted-foreground">
            <Image src="/logo/logo.svg" alt="" width={18} height={18} />
            openmap.lt
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          {user ? (
            <AccountMenuItems
              onRequestCloseMenu={() => setMenuOpen(false)}
              onOpenAccountLinks={() => setAccountLinksOpen(true)}
            />
          ) : (
            <DropdownMenuItem
              onSelect={() => {
                setMenuOpen(false);
                // Defer past the DropdownMenu's own close/focus teardown —
                // opening the Dialog in the same tick races with it and gets
                // dismissed immediately (Radix DropdownMenu + Dialog quirk).
                setTimeout(() => setLoginDialogOpen(true), 0);
              }}
            >
              <LogIn className="size-4" />
              Prisijungti
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Prisijungimas</DialogTitle>
          </DialogHeader>
          <LoginChoiceButtons returnTo={pathname} />
        </DialogContent>
      </Dialog>
      <AccountLinksDialog
        open={accountLinksOpen}
        onOpenChange={setAccountLinksOpen}
      />
    </>
  );
}
