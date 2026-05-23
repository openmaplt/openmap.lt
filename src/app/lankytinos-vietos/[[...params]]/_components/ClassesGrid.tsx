import { ChevronRight, HelpCircle } from "lucide-react";
import { PlaceIcon } from "@/components/PlaceIcon";
import type { ProfileClass } from "@/data/omProfileClasses";

interface ClassesGridProps {
  profileName: string;
  classes: ProfileClass[];
}

export function ClassesGrid({ profileName, classes }: ClassesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {classes.length > 0 ? (
        classes.map((cls) => {
          return (
            <div
              key={cls.name}
              className="bg-card border rounded-2xl p-5 flex flex-col justify-between gap-5 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <PlaceIcon icon={cls.icon} />
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border">
                    {cls.count}
                  </span>
                </div>
                <h2 className="text-base font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {cls.description}
                </h2>
              </div>

              <a
                href={`/lankytinos-vietos/${profileName}/${cls.name}`}
                className="inline-flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wider text-foreground bg-muted hover:bg-accent border border-border/80 px-4 py-2.5 rounded-lg transition-all w-full"
              >
                <span>Žiūrėti sąrašą</span>
                <ChevronRight className="size-3.5" />
              </a>
            </div>
          );
        })
      ) : (
        <div className="col-span-3 p-12 bg-muted/20 border rounded-2xl text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <HelpCircle className="size-8 text-muted-foreground/60" />
          <span>Šiame kataloge šiuo metu objektų klasių nėra.</span>
        </div>
      )}
    </div>
  );
}
