import Link from "next/link";

interface StatCardProps {
  href: string;
  label: string;
  count: number;
}

export function StatCard({ href, label, count }: StatCardProps) {
  return (
    <Link
      href={href}
      className="rounded-md border border-border p-6 space-y-1 hover:bg-accent/40 transition-colors"
    >
      <div className="text-4xl font-extrabold tracking-tight">{count}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </Link>
  );
}
