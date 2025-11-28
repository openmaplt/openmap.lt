import {
  Banknote,
  Beer,
  Binoculars,
  Camera,
  Coffee,
  CreditCard,
  Film,
  Flame,
  Fuel,
  Hammer,
  Home,
  Hotel,
  Landmark,
  Library,
  Mail,
  MapPin,
  Pill,
  Sandwich,
  ShoppingCart,
  Utensils,
} from "lucide-react";
import type * as React from "react";
import { Heritage, Hillfort, Tumulus } from "@/icons";

export type PlaceIcon = {
  icon: React.ElementType;
  color: string;
};

export const PLACE_ICONS: Record<string, PlaceIcon> = {
  // Maistas, gėrimai
  CAF: { icon: Coffee, color: "#7e22ce" },
  FAS: { icon: Sandwich, color: "#7e22ce" },
  RES: { icon: Utensils, color: "#7e22ce" },
  PUB: { icon: Beer, color: "#7e22ce" },

  // Transportas
  FUE: { icon: Fuel, color: "#000000" },
  SPE: { icon: Camera, color: "#000000" },

  // Apgyvendinimas
  HOT: { icon: Hotel, color: "#1d4ed8" },
  GUE: { icon: Home, color: "#1d4ed8" },

  // Paslaugos / Kontoros
  POS: { icon: Mail, color: "#334155" },
  BAN: { icon: Banknote, color: "#047857" },
  ATM: { icon: CreditCard, color: "#047857" },

  // Parduotuvės
  SUP: { icon: ShoppingCart, color: "#4338ca" },
  DIY: { icon: Hammer, color: "#4338ca" },

  // Lankytinos vietos / Kultūra
  ATT: { icon: Landmark, color: "#b45309" },
  MON: { icon: Landmark, color: "#b45309" },
  VIE: { icon: Binoculars, color: "#15803d" },
  HIL: { icon: Hillfort, color: "#b45309" },
  TUM: { icon: Tumulus, color: "#b45309" },
  HER: { icon: Heritage, color: "#b45309" },
  PIC: { icon: Flame, color: "#15803d" },
  CIN: { icon: Film, color: "#7f1d1d" },
  MUS: { icon: Landmark, color: "#7f1d1d" },
  LIB: { icon: Library, color: "#7f1d1d" },
  PHA: { icon: Pill, color: "#0f766e" },
};

// Default fallback icon
export const DEFAULT_ICON: PlaceIcon = {
  icon: MapPin,
  color: "#64748b",
};
