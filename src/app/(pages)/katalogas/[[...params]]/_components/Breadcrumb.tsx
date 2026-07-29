import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { BASE_URL } from "@/config/config";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${BASE_URL}${item.href}` }),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav className="flex items-center gap-2 text-xs font-semibold text-muted-foreground tracking-wide uppercase">
        {items.map((item, index) => (
          <div key={item.label} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="size-3.5 shrink-0" />}
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
