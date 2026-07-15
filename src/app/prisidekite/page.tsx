import type { Metadata } from "next";
import HelpLayout from "@/components/HelpLayout";
import { BASE_URL } from "@/config/config";
import { BugReportSection } from "./_components/BugReportSection";
import { ContributionWays } from "./_components/ContributionWays";
import { EditSection } from "./_components/EditSection";

export const metadata: Metadata = {
  title: "Prisidėkite - Openmap.lt",
  description:
    "Prisidėkite prie atviro ir nemokamo OpenStreetMap Lietuvos žemėlapio kūrimo. Praneškite apie klaidas arba redaguokite patys.",
  alternates: { canonical: `${BASE_URL}/prisidekite` },
};

export default function Page() {
  return (
    <HelpLayout>
      <div className="space-y-12">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-500/90 to-orange-600/90 text-white p-8 sm:p-12 shadow-xl border border-red-500/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Prisidėkite prie žemėlapio kūrimo!
            </h1>
            <p className="text-red-50/90 text-base sm:text-lg leading-relaxed">
              Pastebėjote klaidą žemėlapyje? Trūksta naujo lankytino objekto,
              kavinės ar pažintinio tako? Jūs galite lengvai padėti atviro
              žemėlapio projektui šias klaidas ištaisyti! Žemiau rasite
              paprastas instrukcijas, kaip tai padaryti.
            </p>
          </div>
        </div>

        <ContributionWays />
        <BugReportSection />
        <EditSection />
      </div>
    </HelpLayout>
  );
}
