"use client";

import { ChevronRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AccountMenu } from "@/components/account/AccountMenu";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/providers/AuthProvider";

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              <Image
                src="/logo/logo.svg"
                alt="Openmap.lt"
                width={40}
                height={40}
              />
            </Link>
            <Navigation variant="desktop" />
          </div>

          <div className="flex items-center gap-3">
            {/* Back to Map button */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <span>Žemėlapis</span>
              <ChevronRight className="size-3.5" />
            </Link>

            {/* Login / account */}
            {user ? (
              <AccountMenu />
            ) : (
              <Link
                href={`/prisijungimas?returnTo=${encodeURIComponent(pathname)}`}
                className="hidden md:inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
              >
                Prisijungti
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="inline-flex md:hidden items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none transition-colors"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Atidaryti meniu</span>
              {mobileMenuOpen ? (
                <X className="size-6" aria-hidden="true" />
              ) : (
                <Menu className="size-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-md flex flex-col border-t border-border animate-in fade-in slide-in-from-top duration-200">
          <Navigation
            variant="mobile"
            onNavigate={() => setMobileMenuOpen(false)}
          />
          {!user && (
            <div className="pt-6 border-t border-border mt-6 px-4 flex flex-col gap-3">
              <Link
                href={`/prisijungimas?returnTo=${encodeURIComponent(pathname)}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 border border-border font-semibold py-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <span>Prisijungti</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
