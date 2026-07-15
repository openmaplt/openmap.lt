import { Info } from "lucide-react";
import type { Metadata } from "next";
import HelpLayout from "@/components/HelpLayout";
import { BASE_URL } from "@/config/config";
import { MappingRulesPanel } from "./_components/MappingRulesPanel";

export const metadata: Metadata = {
  title: "Techninė informacija - Openmap.lt",
  description:
    "OSM žymėjimo taisyklės. Techninė informacija apie OpenStreetMap žymes ir sąlygas lankytinų vietų žemėlapyje.",
  alternates: { canonical: `${BASE_URL}/technine-informacija` },
};

export default function Page() {
  return (
    <HelpLayout>
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Techninė informacija
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Žemiau pateikta techninė informacija tiems, kas žymi objektus
            atvirame žemėlapyje <strong>OpenStreetMap (OSM)</strong>. Čia
            nurodyta, kokios žymos (tags) ir sąlygos turi būti priskirtos
            objektui, kad jis atsirastų atitinkamame šio žemėlapio sluoksnyje.
          </p>
          <div className="p-4 bg-muted/40 rounded-xl border text-xs text-muted-foreground flex gap-2">
            <Info className="size-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <p>
              Jeigu pastebėjote netikslumų ar norite papildyti žemėlapį nauju
              objektu, tačiau nenorite gilintis į atvirojo žemėlapio subtilybes
              ir žymėjimą, galite tiesiog{" "}
              <a
                href="/prisidekite"
                className="font-semibold underline hover:text-foreground transition-colors"
              >
                registruoti pastabą (note)
              </a>{" "}
              — bendruomenė mielai padės ją perkelti į žemėlapį!
            </p>
          </div>
        </div>
        <MappingRulesPanel />
      </div>
    </HelpLayout>
  );
}
