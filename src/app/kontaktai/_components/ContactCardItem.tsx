import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

export interface ContactCardItemProps {
  title: string;
  subtitle: string;
  description: string;
  linkText: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export function ContactCardItem({
  title,
  subtitle,
  description,
  linkText,
  href,
  icon: Icon,
  color,
}: ContactCardItemProps) {
  return (
    <div
      className={`bg-gradient-to-br ${color} border rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
    >
      <div className="space-y-3">
        <span className="p-3 rounded-xl bg-background border border-inherit shadow-sm inline-block">
          <Icon className="size-6" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <p className="text-xs font-medium opacity-70">{subtitle}</p>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground bg-background hover:bg-muted border border-border/80 px-4 py-2.5 rounded-lg shadow-sm hover:shadow transition-all w-fit"
      >
        <span>{linkText}</span>
        <ArrowUpRight className="size-3.5" />
      </a>
    </div>
  );
}
