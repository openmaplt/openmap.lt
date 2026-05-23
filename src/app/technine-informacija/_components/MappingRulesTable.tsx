import { Database, HelpCircle } from "lucide-react";
import { PlaceIcon } from "@/components/PlaceIcon";
import type { MappingRule } from "../_data/mapping-rules";

interface MappingRulesTableProps {
  rules: MappingRule[];
}

export function MappingRulesTable({ rules }: MappingRulesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-background">
      <table className="w-full min-w-[600px] border-collapse text-left text-sm">
        <thead className="bg-muted/50 border-b text-xs font-bold uppercase text-muted-foreground">
          <tr>
            <th className="px-6 py-4">Objekto tipas</th>
            <th className="px-6 py-4">
              <div className="flex items-center gap-1.5">
                <Database className="size-3.5" />
                <span>Sąlyga (OpenStreetMap Tags)</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rules.length > 0 ? (
            rules.map((rule) => (
              <tr
                key={rule.type}
                className="hover:bg-accent/15 transition-colors group"
              >
                <td className="px-6 py-4 font-semibold text-foreground flex items-center gap-3">
                  <PlaceIcon
                    icon={rule.icon}
                    size="sm"
                    className="shrink-0 group-hover:border-blue-500/40 transition-colors"
                  />
                  <span>{rule.type}</span>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400 bg-muted/10">
                  <div className="bg-muted/30 p-2.5 rounded-lg border border-border/40 whitespace-pre-wrap leading-relaxed select-all">
                    {rule.condition}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={2}
                className="px-6 py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2"
              >
                <HelpCircle className="size-8 text-muted-foreground/50" />
                <span>Taisyklių pagal jūsų paiešką nerasta.</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
