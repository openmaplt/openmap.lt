import type { LucideIcon } from "lucide-react";
import { Compass } from "lucide-react";

export interface ContributionWayItemProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  anchor: string;
}

export function ContributionWayItem({
  title,
  description,
  icon: Icon,
  color,
  anchor,
}: ContributionWayItemProps) {
  return (
    <div
      className={`bg-gradient-to-br ${color} border rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="space-y-3">
        <span className="p-3 rounded-xl bg-background border border-inherit shadow-sm inline-block">
          <Icon className="size-6" />
        </span>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <a
        href={anchor}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground bg-background hover:bg-muted border border-border/80 px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all w-fit"
      >
        <span>Skaityti daugiau</span>
        <Compass className="size-3.5" />
      </a>
    </div>
  );
}
