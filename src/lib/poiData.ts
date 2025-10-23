/**
 * POI utilities for extracting and structuring POI data
 */

export interface PoiProperties {
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

export interface PoiAttribute {
  key: string;
  value: string;
  type:
    | "name"
    | "text"
    | "address"
    | "link"
    | "phone"
    | "email"
    | "opening_hours"
    | "wikipedia"
    | "heritage"
    | "image"
    | "height"
    | "fee";
  icon?: string;
  label?: string;
}

export interface PoiData {
  attributes: PoiAttribute[];
  osmLink?: {
    view: string;
    edit: string;
  };
}

// Attributes to show in POI popup (in order)
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

// Lucide React icon names for attributes
const ATTRIBUTE_ICONS: Record<string, string> = {
  opening_hours: "Clock",
  email: "Mail",
  phone: "Phone",
  website: "Globe",
  heritage: "Landmark",
  wikipedia: "BookOpen",
  height: "Ruler",
  street: "MapPin",
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
export function formatAddress(properties: PoiProperties): string {
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
export function formatOpeningHours(value: string): string[] {
  const translated = value
    .replace(/(\d)\s*,\s*(\w)/g, "$1;$2")
    .replace(/Mo/g, "Pr")
    .replace(/Tu/g, "An")
    .replace(/We/g, "Tr")
    .replace(/Th/g, "Kt")
    .replace(/Fr/g, "Pt")
    .replace(/Sa/g, "Št")
    .replace(/Su/g, "Sk");

  return translated.split(";").map((line) => line.trim());
}

/**
 * Determine attribute type
 */
function getAttributeType(key: string): PoiAttribute["type"] {
  switch (key) {
    case "name":
      return "name";
    case "street":
      return "address";
    case "website":
      return "link";
    case "phone":
      return "phone";
    case "email":
      return "email";
    case "opening_hours":
      return "opening_hours";
    case "wikipedia":
      return "wikipedia";
    case "heritage":
      return "heritage";
    case "image":
      return "image";
    case "height":
      return "height";
    case "fee":
      return "fee";
    default:
      return "text";
  }
}

/**
 * Extract structured POI data from properties
 */
export function extractPoiData(
  properties: PoiProperties,
  _layerId: string,
): PoiData {
  const attributes: PoiAttribute[] = [];

  for (const key of SHOW_ATTRIBUTES) {
    if (!properties[key]) continue;

    let value = String(properties[key]);
    const type = getAttributeType(key);

    // Special handling for certain types
    if (type === "address") {
      value = formatAddress(properties);
    } else if (type === "fee") {
      value = value === "yes" ? "Yra" : "Nėra";
    } else if (type === "height") {
      value = `${value} m.`;
    }

    attributes.push({
      key,
      value,
      type,
      icon: ATTRIBUTE_ICONS[key],
      label: ATTRIBUTE_LABELS[key],
    });
  }

  // Generate OSM links
  let osmLink: PoiData["osmLink"];
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
      osmLink = {
        view: `${baseUrl}${type}/${properties.id}`,
        edit: `${baseUrl}edit?${type}=${properties.id}`,
      };
    }
  }

  return { attributes, osmLink };
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
