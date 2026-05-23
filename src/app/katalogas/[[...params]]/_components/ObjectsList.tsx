import { HelpCircle, MapPin } from "lucide-react";
import type { ClassObject } from "@/data/omProfileClassObjects";

interface ObjectsListProps {
  objects: ClassObject[];
}

export function ObjectsList({ objects }: ObjectsListProps) {
  if (objects.length === 0) {
    return (
      <div className="p-12 bg-muted/20 border rounded-2xl text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
        <HelpCircle className="size-8 text-muted-foreground/60" />
        <span>Šioje kategorijoje šiuo metu objektų nėra sužymėta.</span>
      </div>
    );
  }

  const grouped = objects.reduce<Record<string, ClassObject[]>>((acc, obj) => {
    const letter = obj.name.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(obj);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {objects.length} objektai
        </span>
        <div className="flex flex-wrap gap-1">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="text-xs font-bold px-1.5 py-0.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              {letter}
            </a>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {letters.map((letter) => (
          <div key={letter} id={`letter-${letter}`} className="scroll-mt-4">
            <h2 className="text-base font-bold text-muted-foreground border-b pb-2 mb-1">
              {letter}
            </h2>
            <ul>
              {grouped[letter].map((obj) => (
                <li key={obj.url}>
                  <a
                    href={obj.url}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {obj.name}
                      </span>
                      {obj.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {obj.description}
                        </p>
                      )}
                    </div>
                    <MapPin className="size-3.5 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
