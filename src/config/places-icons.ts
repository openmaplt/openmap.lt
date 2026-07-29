import {
  Baby,
  Banknote,
  Beer,
  Binoculars,
  Bubbles,
  Building,
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
  GraduationCap,
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
  School,
  ShoppingCart,
  Sofa,
  Tent,
  Theater,
  TowerControl,
  Trees,
  University,
  Utensils,
  Wrench,
} from "lucide-react";
import type * as React from "react";
import { Heritage, Hillfort, Tumulus } from "@/icons";

export type PlaceIcon = {
  icon: React.ElementType;
  color: string;
  name: string;
};

export const PLACE_ICONS: Record<string, PlaceIcon> = {
  // Paveldas
  HIL: { icon: Hillfort, color: "#b45309", name: "Piliakalnis" },
  TUM: { icon: Tumulus, color: "#b45309", name: "Pilkapis" },
  MAN: { icon: Castle, color: "#b45309", name: "Dvaras" },
  HER: { icon: Heritage, color: "#b45309", name: "Kultūros paveldas" },
  HIS: { icon: Landmark, color: "#b45309", name: "Istorinis objektas" },
  MON: { icon: Landmark, color: "#b45309", name: "Vienuolynas" },

  // Turizmas
  INF: { icon: Info, color: "#15803d", name: "Turizmo informacija" },
  ATT: { icon: MapPin, color: "#15803d", name: "Lankytina vieta" },
  VIE: { icon: Binoculars, color: "#15803d", name: "Vaizdinga vieta" },
  STO: { icon: Bubbles, color: "#15803d", name: "Gamtos objektas, akmuo" },
  TRE: { icon: Trees, color: "#15803d", name: "Gamtos objektas, medis" },
  SPR: { icon: Droplet, color: "#15803d", name: "Šaltinis" },
  HIK: { icon: Footprints, color: "#15803d", name: "Pažintinis takas" },
  TOW: { icon: TowerControl, color: "#15803d", name: "Apžvalgos bokštas" },
  PIC: { icon: Sofa, color: "#15803d", name: "Poilsiavietė be laužavietės" },
  PIF: { icon: Flame, color: "#15803d", name: "Poilsiavietė su laužaviete" },

  // Apgyvendinimas
  CAM: { icon: Tent, color: "#1d4ed8", name: "Kempingas" },
  GUE: { icon: Home, color: "#1d4ed8", name: "Svečių namai" },
  HOT: { icon: Hotel, color: "#1d4ed8", name: "Viešbutis" },

  // Transportas
  FUE: { icon: Fuel, color: "#000000", name: "Degalinė" },
  SPE: { icon: Camera, color: "#000000", name: "Greičio kamera" },
  WAS: { icon: CarFront, color: "#000000", name: "Plovykla" },
  CAR: { icon: Wrench, color: "#000000", name: "Autoservisas" },

  // Maistas, gėrimai
  CAF: { icon: Coffee, color: "#7e22ce", name: "Kavinė" },
  FAS: { icon: Sandwich, color: "#7e22ce", name: "Greitas maistas" },
  RES: { icon: Utensils, color: "#7e22ce", name: "Restoranas" },
  PUB: { icon: Beer, color: "#7e22ce", name: "Aludė, baras" },

  // Kultūra
  THE: { icon: Theater, color: "#7f1d1d", name: "Teatras" },
  CIN: { icon: Film, color: "#7f1d1d", name: "Kinoteatras" },
  ART: { icon: Palette, color: "#7f1d1d", name: "Meno centras" },
  MUS: { icon: Landmark, color: "#7f1d1d", name: "Muziejus" },
  LIB: { icon: Library, color: "#7f1d1d", name: "Biblioteka" },

  // Sveikata
  PHA: { icon: Pill, color: "#0f766e", name: "Vaistinė" },

  // Parduotuvės
  SUP: { icon: ShoppingCart, color: "#4338ca", name: "Parduotuvė" },
  DIY: { icon: Hammer, color: "#4338ca", name: "Pasidaryk pats" },

  // Religija
  CHU: { icon: CrossIcon, color: "#c2410c", name: "Bažnyčia" },
  LUT: { icon: CrossIcon, color: "#c2410c", name: "Bažnyčia (liut.)" },
  ORT: { icon: Church, color: "#c2410c", name: "Cerkvė" },
  ORE: { icon: Church, color: "#c2410c", name: "Maldos namai" },
  MNS: { icon: Church, color: "#c2410c", name: "Vienuolynas" },

  // Kontoros
  POS: { icon: Mail, color: "#334155", name: "Paštas" },
  BAN: { icon: Banknote, color: "#047857", name: "Bankas" },
  ATM: { icon: CreditCard, color: "#047857", name: "Bankomatas" },
  GOV: { icon: Building, color: "#888888", name: "Valstybės įstaiga" },

  // Finansasi
  // Švietimas
  KIN: { icon: Baby, color: "#888888", name: "Darželis" },
  SCH: { icon: School, color: "#888888", name: "Mokykla" },
  COL: { icon: University, color: "#888888", name: "Koledžas" },
  UNI: { icon: GraduationCap, color: "#888888", name: "Universitetas" },
};

// Default fallback icon
export const DEFAULT_ICON: PlaceIcon = {
  icon: MapPin,
  color: "#64748b",
  name: "Objektas",
};
