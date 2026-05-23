import { ArrowUpRight, Info } from "lucide-react";
import type { Metadata } from "next";
import HelpLayout from "@/components/HelpLayout";
import SafeImage from "@/components/SafeImage";
import { DataCards } from "./_components/DataCards";

export const metadata: Metadata = {
  title: "Žemėlapio duomenys - Openmap.lt",
  description:
    "Iš kur imami duomenys atviram OpenStreetMap Lietuvos žemėlapiui. Atsisiuntimai, programėlės ir Garmin palaikymas.",
};

export default function Page() {
  return (
    <HelpLayout>
      <div className="space-y-12">
        <div className="bg-card border rounded-2xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="relative size-24 sm:size-32 shrink-0 rounded-xl overflow-hidden bg-muted border p-4 flex items-center justify-center shadow-inner">
              <SafeImage
                src="https://places.openmap.lt/osm-logo.png"
                alt="OpenStreetMap logotipas"
                className="w-full h-full object-contain filter dark:invert-0 dark:brightness-100"
              />
              <span className="absolute inset-0 flex items-center justify-center font-black text-xs text-muted-foreground/60 select-none text-center px-2">
                OpenStreetMap
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Žemėlapio pagrindas ir šaltiniai
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Tiek žemėlapio pagrindas, tiek lankytinų vietų informacija yra
                paimti iš atviro ir nemokamo viso pasaulio žemėlapio projekto —{" "}
                <a
                  href="https://www.openstreetmap.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                >
                  OpenStreetMap (OSM) <ArrowUpRight className="size-3" />
                </a>
                . Tai bendruomeninis geografinių duomenų projektas, kurį kuria
                ir prižiūri milijonai naudotojų bei savanorių visame pasaulyje.
              </p>
              <div className="p-4 bg-muted/40 rounded-xl border border-border/60 text-xs text-muted-foreground space-y-2">
                <div className="flex gap-2">
                  <Info className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  <p>
                    Atvirame žemėlapyje yra žymiai daugiau duomenų, nei
                    atvaizduojame šiame portale. Jei manote, kad į šį žemėlapį
                    tiktų įdėti papildomų sluoksnių ar objektų tipų,{" "}
                    <a
                      href="/kontaktai"
                      className="font-medium underline hover:text-foreground transition-colors"
                    >
                      susisiekite su mumis
                    </a>
                    . Norėdami patys pranešti apie trūkstamas vietas, skaitykite
                    skiltį{" "}
                    <a
                      href="/prisidekite"
                      className="font-medium underline hover:text-foreground transition-colors"
                    >
                      „Prisidėkite"
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DataCards />
      </div>
    </HelpLayout>
  );
}
