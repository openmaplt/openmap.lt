import type { LucideIcon } from "lucide-react";
import SafeImage from "@/components/SafeImage";

export interface NewsTimelineItemProps {
  date: string;
  title: string;
  description: string;
  icon: LucideIcon;
  steps?: string[];
  imageUrl?: string;
}

export function NewsTimelineItem({
  date,
  title,
  description,
  icon: Icon,
  steps,
  imageUrl,
}: NewsTimelineItemProps) {
  return (
    <div className="relative group">
      <span className="absolute -left-[35px] top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-emerald-500 shadow-sm group-hover:scale-110 transition-transform duration-200">
        <Icon className="size-3 text-emerald-600 dark:text-emerald-400" />
      </span>

      <div className="bg-card hover:bg-card/85 border rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {title}
          </h3>
          <span className="text-xs font-semibold font-mono text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded-full w-fit">
            {date}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {steps && (
          <ol className="list-decimal pl-5 text-xs text-muted-foreground space-y-1 bg-muted/30 p-4 rounded-lg border border-border/55">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}

        {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border bg-muted shadow-sm w-fit max-w-screen-md">
            <SafeImage
              src={imageUrl}
              alt={title}
              className="max-w-full h-auto object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        )}
      </div>
    </div>
  );
}
