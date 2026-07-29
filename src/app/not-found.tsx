import { Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <div className="h-full w-full overflow-hidden bg-background text-foreground flex flex-col antialiased">
      <Header />
      <main className="flex-1 w-full overflow-y-auto min-h-0 bg-gradient-to-b from-background via-background to-accent/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-8">
            <span className="text-[9rem] font-black leading-none tracking-tighter text-border select-none">
              404
            </span>

            <div className="space-y-2 max-w-sm">
              <h1 className="text-2xl font-bold tracking-tight">
                Puslapis nerastas
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Šio adreso puslapis neegzistuoja — galbūt nuoroda yra pasenusi
                arba adresas buvo įvestas neteisingai.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-colors"
              >
                <MapIcon className="size-4" />
                Atidaryti žemėlapį
              </Link>
              <Link
                href="/katalogas"
                className="inline-flex items-center gap-2 border border-border hover:bg-accent px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Naršyti katalogą
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
