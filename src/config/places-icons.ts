import {
  Banknote,
  Beer,
  Binoculars,
  Bubbles,
  Camera,
  CarFront,
  Castle,
  Church,
  Coffee,
  CreditCard,
  CrossIcon,
  Droplet,
  Film,
  Flame,
  Footprints,
  Fuel,
  Hammer,
  Home,
  Hotel,
  Info,
  Landmark,
  Library,
  Mail,
  MapPin,
  Palette,
  Pill,
  Sandwich,
  ShoppingCart,
  Sofa,
  Tent,
  Theater,
  TowerControl,
  Trees,
  Utensils,
  Wrench,
} from "lucide-react";
import type * as React from "react";
import { Heritage, Hillfort, Tumulus } from "@/icons";

export type PlaceIcon = {
  icon: React.ElementType;
  color: string;
};

export const PLACE_ICONS: Record<string, PlaceIcon> = {
  // Paveldas
  HIL: { icon: Hillfort, color: "#b45309" },
  TUM: { icon: Tumulus, color: "#b45309" },
  MAN: { icon: Castle, color: "#b45309" },
  HER: { icon: Heritage, color: "#b45309" },
  HIS: { icon: Landmark, color: "#b45309" },
  MON: { icon: Landmark, color: "#b45309" },

  // Turizmas
  INF: { icon: Info, color: "#15803d" },
  ATT: { icon: MapPin, color: "#15803d" },
  VIE: { icon: Binoculars, color: "#15803d" },
  STO: { icon: Bubbles, color: "#15803d" },
  TRE: { icon: Trees, color: "#15803d" },
  SPR: { icon: Droplet, color: "#15803d" },
  HIK: { icon: Footprints, color: "#15803d" },
  TOW: { icon: TowerControl, color: "#15803d" },
  PIC: { icon: Sofa, color: "#15803d" },
  PIF: { icon: Flame, color: "#15803d" },

  // Apgyvendinimas
  CAM: { icon: Tent, color: "#1d4ed8" },
  GUE: { icon: Home, color: "#1d4ed8" },
  HOT: { icon: Hotel, color: "#1d4ed8" },

  // Transportas
  FUE: { icon: Fuel, color: "#000000" },
  SPE: { icon: Camera, color: "#000000" },
  WAS: { icon: CarFront, color: "#000000" },
  CAR: { icon: Wrench, color: "#000000" },

  // Maistas, gėrimai
  CAF: { icon: Coffee, color: "#7e22ce" },
  FAS: { icon: Sandwich, color: "#7e22ce" },
  RES: { icon: Utensils, color: "#7e22ce" },
  PUB: { icon: Beer, color: "#7e22ce" },

  // Kultūra
  THE: { icon: Theater, color: "#7f1d1d" },
  CIN: { icon: Film, color: "#7f1d1d" },
  ART: { icon: Palette, color: "#7f1d1d" },
  MUS: { icon: Landmark, color: "#7f1d1d" },
  LIB: { icon: Library, color: "#7f1d1d" },

  // Sveikata
  PHA: { icon: Pill, color: "#0f766e" },

  // Parduotuvės
  SUP: { icon: ShoppingCart, color: "#4338ca" },
  DIY: { icon: Hammer, color: "#4338ca" },

  // Religija
  CHU: { icon: CrossIcon, color: "#c2410c" },
  LUT: { icon: CrossIcon, color: "#c2410c" },
  ORT: { icon: Church, color: "#c2410c" },
  ORE: { icon: Church, color: "#c2410c" },
  MNS: { icon: Church, color: "#c2410c" },

  // Kontoros
  POS: { icon: Mail, color: "#334155" },
  BAN: { icon: Banknote, color: "#047857" },
  ATM: { icon: CreditCard, color: "#047857" },

  // Finansasi
};

// Default fallback icon
export const DEFAULT_ICON: PlaceIcon = {
  icon: MapPin,
  color: "#64748b",
};
