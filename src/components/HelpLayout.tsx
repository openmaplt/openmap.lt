"use client";

import { ChevronRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { AccountMenu } from "@/components/account/AccountMenu";
import { MENU_ITEMS } from "@/config/nav";
import { useAuth } from "@/providers/AuthProvider";

interface HelpLayoutProps {
  children: React.ReactNode;
}

export default function HelpLayout({ children }: HelpLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-full w-full overflow-hidden bg-background text-foreground flex flex-col antialiased">
      {/* Premium Glassmorphic Header */}
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

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
                      isActive
                        ? "bg-secondary text-secondary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Back to Map button */}
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
                className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors"
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
          <nav className="flex-1 space-y-1 px-4 py-6">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <Icon className="size-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-6 border-t border-border mt-6 px-4 flex flex-col gap-3">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <span>Atgal į žemėlapį</span>
              </Link>
              {!user && (
                <Link
                  href={`/prisijungimas?returnTo=${encodeURIComponent(pathname)}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 border border-border font-semibold py-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <span>Prisijungti</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Scrollable Viewport Wrapper for page content */}
      <main className="flex-1 w-full overflow-y-auto min-h-0 bg-gradient-to-b from-background via-background to-accent/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
