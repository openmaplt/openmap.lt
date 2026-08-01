interface CountBadgeProps {
  count: number;
}

export function CountBadge({ count }: CountBadgeProps) {
  return (
    <span className="ml-auto inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold min-w-5 h-5 px-1.5">
      {count}
    </span>
  );
}
