import { Eye, HelpCircle } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import type { SightObject } from "@/data/omProfileClassObjects";

interface ObjectsGridProps {
  objects: SightObject[];
}

export function ObjectsGrid({ objects }: ObjectsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {objects.length > 0 ? (
        objects.map((obj) => (
          <div
            key={obj.url}
            className="bg-card border rounded-2xl p-5 flex flex-col justify-between gap-5 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="size-8 rounded-lg bg-muted border flex items-center justify-center shadow-inner overflow-hidden">
                  <SafeImage
                    src={`https://places.openmap.lt/img/${obj.icon}.png`}
                    alt={obj.description}
                    className="size-5 object-contain"
                  />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded border">
                  OSM POI
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-foreground leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {obj.description}
              </h2>
            </div>

            <a
              href={obj.url}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-600/90 px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all w-full"
            >
              <Eye className="size-4" />
              <span>Peržiūrėti žemėlapyje</span>
            </a>
          </div>
        ))
      ) : (
        <div className="col-span-3 p-12 bg-muted/20 border rounded-2xl text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <HelpCircle className="size-8 text-muted-foreground/60" />
          <span>Šioje kategorijoje šiuo metu objektų nėra sužymėta.</span>
        </div>
      )}
    </div>
  );
}
