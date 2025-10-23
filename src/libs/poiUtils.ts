/**
 * POI utilities for formatting and displaying POI information
 */

interface PoiProperties {
  id?: number | string;
  __type__?: string;
  name?: string;
  official_name?: string;
  alt_name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  post_code?: string;
  opening_hours?: string;
  email?: string;
  phone?: string;
  website?: string;
  heritage?: string;
  wikipedia?: string;
  height?: string;
  fee?: string;
  image?: string;
  [key: string]: string | number | undefined;
}

// Attributes to show in POI popup
const SHOW_ATTRIBUTES = [
  "name",
  "official_name",
  "alt_name",
  "street",
  "opening_hours",
  "email",
  "phone",
  "website",
  "heritage",
  "wikipedia",
  "height",
  "fee",
  "image",
];

// Lithuanian labels for attributes
const ATTRIBUTE_LABELS: Record<string, string> = {
  official_name: "Oficialus pavadinimas",
  alt_name: "Kiti pavadinimai",
  street: "Adresas",
  email: "E-paštas",
  phone: "Telefono nr.",
  fee: "Mokestis",
};

// Icons for attributes (using simple emoji for now)
const ATTRIBUTE_ICONS: Record<string, string> = {
  opening_hours: "🕒",
  email: "✉️",
  phone: "📞",
  website: "🌐",
  heritage: "🏛️",
  wikipedia: "📖",
  height: "📏",
  street: "📍",
};

// Attribute types for formatting
const ATTRIBUTE_TYPES: Record<string, string> = {
  name: "bold",
  website: "link",
  image: "image",
  street: "address",
  heritage: "kvr_link",
  wikipedia: "wikipedia",
  height: "height",
  fee: "fee",
  phone: "phone",
  opening_hours: "opening_hours",
};

// Layer code mapping (for object IDs)
const LAYER_CODE: Record<string, string> = {
  a: "label-address",
  p: "label-amenity",
};

/**
 * Get layer code from layer ID
 */
export function getLayerCode(layerId: string): string {
  return (
    Object.keys(LAYER_CODE).find((key) => LAYER_CODE[key] === layerId) || ""
  );
}

/**
 * Get object ID from properties and layer
 */
export function getObjectId(
  properties: PoiProperties,
  layerId: string,
): string | null {
  if (typeof properties.id === "undefined") {
    return null;
  }
  const code = getLayerCode(layerId);
  return code ? `${code}${properties.id}` : null;
}

/**
 * Format address from properties
 */
function getAddress(properties: PoiProperties): string {
  let address = "";
  if (properties.street) {
    address += properties.street;
  }
  if (properties.housenumber) {
    address += ` ${properties.housenumber}`;
  }
  if (properties.city) {
    address += `, ${properties.city}`;
  }
  if (properties.post_code) {
    let code = properties.post_code;
    if (code.match(/\d+/)) {
      code = `LT-${code}`;
    }
    address += ` ${code}`;
  }
  return address;
}

/**
 * Format opening hours to Lithuanian
 */
function formatOpeningHours(value: string): string {
  const parts = value
    .replace(/(\d)\s*,\s*(\w)/g, "$1;$2")
    .replace("Mo", "Pr")
    .replace("Tu", "An")
    .replace("We", "Tr")
    .replace("Th", "Kt")
    .replace("Fr", "Pt")
    .replace("Sa", "Št")
    .replace("Su", "Sk")
    .split(";");

  return parts.join("<br><span style='margin-left: 1.5em;'></span> ");
}

/**
 * Format attribute value based on type
 */
function formatValue(attribute: string, properties: PoiProperties): string {
  const value = properties[attribute];
  const type = ATTRIBUTE_TYPES[attribute];

  if (!value) return "";

  switch (type) {
    case "bold":
      return `<strong>${value}</strong>`;
    case "height":
      return `${value} m.`;
    case "fee":
      return value === "yes" ? "Yra" : "Nėra";
    case "link":
      return `<a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>`;
    case "kvr_link":
      return `<a href="https://kvr.kpd.lt/heritage/Pages/KVRDetail.aspx?lang=lt&MC=${value}" target="_blank" rel="noopener noreferrer">Kultūros vertybių registras</a>`;
    case "image":
      return `<a href="${value}" target="_blank" rel="noopener noreferrer"><img src="${value}" style="max-width: 100%; height: auto;" /></a>`;
    case "address":
      return getAddress(properties);
    case "phone":
      return `<a href="tel:${value}">${value}</a>`;
    case "wikipedia": {
      const [lang, title] = String(value).split(":");
      return `<a href="https://${lang}.wikipedia.org/wiki/${title.replace(/\s/g, "_")}" target="_blank" rel="noopener noreferrer">${title}</a>`;
    }
    case "opening_hours":
      return formatOpeningHours(String(value));
    default:
      return String(value);
  }
}

/**
 * Generate HTML for POI popup
 */
export function generatePoiHtml(
  properties: PoiProperties,
  _layerId: string,
): string {
  const lines: string[] = [];

  // Add attribute lines
  for (const attribute of SHOW_ATTRIBUTES) {
    if (!properties[attribute]) continue;

    const formattedValue = formatValue(attribute, properties);
    const icon = ATTRIBUTE_ICONS[attribute];
    const label = ATTRIBUTE_LABELS[attribute];

    if (icon) {
      lines.push(`<span>${icon}</span> ${formattedValue}`);
    } else if (label) {
      lines.push(`<strong>${label}:</strong> ${formattedValue}`);
    } else {
      lines.push(formattedValue);
    }
  }

  // Add OSM links
  if (properties.id && properties.__type__) {
    let type: string;
    switch (properties.__type__) {
      case "n":
        type = "node";
        break;
      case "w":
        type = "way";
        break;
      case "r":
        type = "relation";
        break;
      default:
        type = "";
    }

    if (type) {
      const baseUrl = "https://www.openstreetmap.org/";
      lines.push(
        `<span>🗄️</span>&nbsp;<a href="${baseUrl}${type}/${properties.id}" target="_blank" rel="noopener noreferrer">OSM</a>` +
          `&nbsp;<span>✏️</span>&nbsp;<a href="${baseUrl}edit?${type}=${properties.id}" target="_blank" rel="noopener noreferrer">Edit</a>`,
      );
    }
  }

  return lines.join("<br />");
}

/**
 * Parse object ID from URL to get layer and feature ID
 */
export function parseObjectId(objectId: string): {
  layerId: string;
  featureId: number;
} | null {
  if (!objectId || objectId.length < 2) {
    return null;
  }

  const code = objectId.charAt(0);
  const layerId = LAYER_CODE[code];

  if (!layerId) {
    return null;
  }

  const featureId = Number.parseInt(objectId.substring(1), 10);

  if (Number.isNaN(featureId)) {
    return null;
  }

  return { layerId, featureId };
}
