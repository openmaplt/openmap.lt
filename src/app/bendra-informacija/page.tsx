import type { Metadata } from "next";
import HelpLayout from "@/components/HelpLayout";
import { NewsTimeline } from "./_components/NewsTimeline";

export const metadata: Metadata = {
  title: "Bendra informacija - Openmap.lt",
  description:
    "Lietuvos lankytinos vietos atvirame ir nemokamame OpenStreetMap žemėlapyje. Bendra informacija apie projektą.",
};

export default function Page() {
  return (
    <HelpLayout>
      <div className="space-y-12">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-600/90 to-teal-700/90 text-white p-8 sm:p-12 shadow-xl border border-emerald-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Lietuvos lankytinos vietos
            </h1>
            <p className="text-emerald-50/90 text-base sm:text-lg leading-relaxed">
              Tai seniausias Lietuvos lankytinų vietų žemėlapis. Žemėlapis
              paremtas atvira{" "}
              <a
                href="https://www.openstreetmap.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors font-semibold"
              >
                OpenStreetMap
              </a>{" "}
              informacija. Lankytinas vietas įvesti <strong>nemokamai</strong>{" "}
              gali bet kas. Taip pat nemokamai išsitraukti ir naudoti savo
              tikslais irgi gali bet kas, kol tenkinamos ODbL licencijos sąlygos
              (paminimas šaltinis ir išvestinis duomenų rinkinys išlieka
              atviras).
            </p>
          </div>
        </div>
        <NewsTimeline />
      </div>
    </HelpLayout>
  );
}
