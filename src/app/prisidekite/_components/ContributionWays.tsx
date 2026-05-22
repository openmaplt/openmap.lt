import { Flag, PenTool } from "lucide-react";
import { ContributionWayItem } from "./ContributionWayItem";

const CONTRIBUTION_WAYS = [
  {
    title: "1. Klaidų pranešimas (Notes)",
    description:
      "Paprasčiausias būdas padėti — tiesiog pažymėti klaidingą vietą žemėlapyje. Tam nereikia jokių techninių žinių, o registracija neprivaloma.",
    icon: Flag,
    color:
      "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
    anchor: "#klaidos",
  },
  {
    title: "2. Žemėlapio redagavimas",
    description:
      "Norite rimčiau prisidėti? Tapkite vienu iš tūkstančių Lietuvos žymėtojų ir patys tiesiogiai keiskite kelius, pastatus ar lankytinas vietas.",
    icon: PenTool,
    color:
      "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    anchor: "#redagavimas",
  },
];

export function ContributionWays() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {CONTRIBUTION_WAYS.map((way) => (
        <ContributionWayItem key={way.title} {...way} />
      ))}
    </div>
  );
}
