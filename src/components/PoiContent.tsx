import {
  Beer,
  BookOpen,
  Clock,
  ExternalLink,
  Globe,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Ruler,
} from "lucide-react";
import {
  formatOpeningHours,
  type PoiAttribute,
  type PoiData,
} from "@/lib/poiData";

interface PoiContentProps {
  data: PoiData;
}

// Map icon names to Lucide components
const iconComponents: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Clock,
  Mail,
  Phone,
  Globe,
  Landmark,
  BookOpen,
  Ruler,
  MapPin,
  Beer,
};

function AttributeValue({ attribute }: { attribute: PoiAttribute }) {
  const { type, value } = attribute;

  switch (type) {
    case "name":
      return <strong className="text-lg text-foreground">{value}</strong>;

    case "link":
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          {value}
          <ExternalLink className="w-3 h-3" />
        </a>
      );

    case "phone":
      return (
        <a href={`tel:${value}`} className="text-foreground hover:underline">
          {value}
        </a>
      );

    case "email":
      return (
        <a href={`mailto:${value}`} className="text-foreground hover:underline">
          {value}
        </a>
      );

    case "wikipedia": {
      const [lang, title] = value.split(":");
      const url = `https://${lang}.wikipedia.org/wiki/${title.replace(/\s/g, "_")}`;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          {title}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }

    case "heritage":
      return (
        <a
          href={`https://kvr.kpd.lt/heritage/Pages/KVRDetail.aspx?lang=lt&MC=${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
        >
          Kultūros vertybių registras
          <ExternalLink className="w-3 h-3" />
        </a>
      );

    case "image":
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2"
        >
          {/* biome-ignore lint/performance/noImgElement: External POI images don't need Next.js optimization */}
          <img
            src={value}
            alt="POI"
            className="max-w-full h-auto rounded-md"
            loading="lazy"
          />
        </a>
      );

    case "opening_hours": {
      const lines = formatOpeningHours(value);
      return (
        <div className="space-y-1">
          {lines.map((line) => (
            <div key={line} className="text-foreground">
              {line}
            </div>
          ))}
        </div>
      );
    }

    case "description": {
      // Escape everything first to prevent arbitrary HTML, then unescape only a small
      // set of allowed tags (br, b, strong). Also convert newlines to <br/>.
      const escapeHtml = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      let html = escapeHtml(value)
        // Normalize CRLF
        .replace(/\r\n/g, "\n")
        // Preserve newlines as breaks
        .replace(/\n/g, "<br/>");

      // Allow certain tags encoded as entities (&lt;b&gt;, &lt;br&gt;, &lt;strong&gt;)
      html = html.replace(/&lt;(\/?)\s*(b|strong)\s*&gt;/gi, "<$1$2>");
      html = html.replace(/&lt;br\s*\/?&gt;/gi, "<br/>");

      // NOTE: This is a lightweight sanitizer. For untrusted input consider
      // using a robust library like DOMPurify to allow a controlled tag/set.
      return (
        <div
          className="text-lg text-foreground"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    default:
      return <span className="text-foreground">{value}</span>;
  }
}

export function PoiContent({ data }: PoiContentProps) {
  return (
    <div className="space-y-3 min-w-[200px] max-w-[400px] px-4">
      {data.attributes.map((attribute) => {
        const IconComponent = attribute.icon
          ? iconComponents[attribute.icon]
          : null;

        if (attribute.key === "name") {
          return null;
        }

        return (
          <div key={attribute.key} className="flex gap-2 items-start">
            {IconComponent && (
              <IconComponent className="flex-shrink-0 w-4 h-4 mt-1 text-foreground" />
            )}
            <div className="flex-1 min-w-0">
              {attribute.label && attribute.type !== "name" && (
                <span className="font-semibold text-foreground">
                  {attribute.label}:{" "}
                </span>
              )}
              <AttributeValue attribute={attribute} />
            </div>
          </div>
        );
      })}

      {data.osmLink && (
        <div className="flex gap-4 pt-2 border-t border-border text-sm">
          <a
            href={data.osmLink.view}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <MapPin className="w-4 h-4" />
            OSM
          </a>
          <a
            href={data.osmLink.edit}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            Edit
          </a>
        </div>
      )}
    </div>
  );
}
