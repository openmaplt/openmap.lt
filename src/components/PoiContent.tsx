import { ExternalLink, MapPin } from "lucide-react";
import {
  formatOpeningHours,
  type PoiAttribute,
  type PoiData,
} from "@/libs/poiData";

interface PoiContentProps {
  data: PoiData;
}

function AttributeValue({ attribute }: { attribute: PoiAttribute }) {
  const { type, value } = attribute;

  switch (type) {
    case "name":
      return <strong className="text-lg">{value}</strong>;

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
        <a href={`tel:${value}`} className="hover:underline">
          {value}
        </a>
      );

    case "email":
      return (
        <a href={`mailto:${value}`} className="hover:underline">
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
            <div key={line} className="text-sm">
              {line}
            </div>
          ))}
        </div>
      );
    }

    default:
      return <span>{value}</span>;
  }
}

export function PoiContent({ data }: PoiContentProps) {
  return (
    <div className="space-y-3 min-w-[200px] max-w-[400px]">
      {data.attributes.map((attribute) => (
        <div key={attribute.key} className="flex gap-2">
          {attribute.icon && (
            <span className="flex-shrink-0 text-base" aria-hidden="true">
              {attribute.icon}
            </span>
          )}
          <div className="flex-1 min-w-0">
            {attribute.label && attribute.type !== "name" && (
              <span className="font-semibold">{attribute.label}: </span>
            )}
            <AttributeValue attribute={attribute} />
          </div>
        </div>
      ))}

      {data.osmLink && (
        <div className="flex gap-4 pt-2 border-t border-gray-200 dark:border-gray-700 text-sm">
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
