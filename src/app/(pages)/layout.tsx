import type React from "react";
import { Header } from "@/components/Header";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full w-full overflow-hidden bg-background text-foreground flex flex-col antialiased">
      <Header />
      <main className="flex-1 w-full overflow-y-auto min-h-0 bg-gradient-to-b from-background via-background to-accent/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
