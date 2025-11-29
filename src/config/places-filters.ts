import {
  Banknote,
  Beer,
  Binoculars,
  Briefcase,
  Building,
  Building2,
  Camera,
  CarFront,
  Castle,
  Church,
  Coffee,
  CreditCard,
  Cross as CrossIcon,
  Stethoscope as Doctor,
  Film,
  Flame,
  Footprints,
  Fuel,
  Gavel,
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
  ScrollText,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sofa,
  Stethoscope,
  Store,
  Tent,
  Theater,
  TowerControl,
  Trees,
  Utensils,
  Wrench,
} from "lucide-react";
import type * as React from "react";
import { Heritage, Hillfort, Tumulus } from "@/icons";

export type FilterItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

export type FilterCategory = {
  label: string;
  color: string;
  textColor: string;
  hexColor: string;
  items: FilterItem[];
};

export const PLACES_FILTERS: FilterCategory[] = [
  {
    label: "Paveldas",
    color: "bg-amber-700",
    textColor: "text-amber-700",
    hexColor: "#b45309",
    items: [
      { id: "b", label: "Piliakalniai", icon: Hillfort },
      { id: "e", label: "Pilkapiai", icon: Tumulus },
      { id: "f", label: "Dvarai", icon: Castle },
      { id: "c", label: "Paveldas", icon: Heritage },
      { id: "a", label: "Kiti istoriniai", icon: Landmark },
    ],
  },
  {
    label: "Turizmas",
    color: "bg-green-700",
    textColor: "text-green-700",
    hexColor: "#15803d",
    items: [
      { id: "t", label: "Turizmo informacija", icon: Info },
      { id: "h", label: "Lankytinos vietos", icon: MapPin },
      { id: "W", label: "Vaizdingos vietos", icon: Binoculars },
      { id: "3", label: "Gamtos paveldas", icon: Trees },
      { id: "1", label: "Pažintiniai takai", icon: Footprints },
      { id: "g", label: "Bokštai", icon: TowerControl },
      { id: "j", label: "Poilsiavietės su laužaviete", icon: Flame },
      { id: "k", label: "Poilsiavietės be laužavietės", icon: Sofa },
    ],
  },
  {
    label: "Apgyvendinimas",
    color: "bg-blue-700",
    textColor: "text-blue-700",
    hexColor: "#1d4ed8",
    items: [
      { id: "l", label: "Kempingai", icon: Tent },
      { id: "m", label: "Hosteliai, svečių namai", icon: Home },
      { id: "s", label: "Viešbučiai", icon: Hotel },
    ],
  },
  {
    label: "Transportas",
    color: "bg-black",
    textColor: "text-black",
    hexColor: "#000000",
    items: [
      { id: "n", label: "Degalinės", icon: Fuel },
      { id: "w", label: "Greičio kameros", icon: Camera },
      { id: "T", label: "Plovyklos", icon: CarFront },
      { id: "G", label: "Servisai", icon: Wrench },
    ],
  },
  {
    label: "Maistas, gėrimai",
    color: "bg-purple-700",
    textColor: "text-purple-700",
    hexColor: "#7e22ce",
    items: [
      { id: "o", label: "Kavinės", icon: Coffee },
      { id: "p", label: "Greitas maistas", icon: Sandwich },
      { id: "q", label: "Restoranai", icon: Utensils },
      { id: "r", label: "Aludės, barai", icon: Beer },
    ],
  },
  {
    label: "Kultūra",
    color: "bg-red-900",
    textColor: "text-red-900",
    hexColor: "#7f1d1d",
    items: [
      { id: "u", label: "Teatrai", icon: Theater },
      { id: "v", label: "Kino teatrai", icon: Film },
      { id: "x", label: "Meno centrai", icon: Palette },
      { id: "i", label: "Muziejai", icon: Landmark },
      { id: "y", label: "Bibliotekos", icon: Library },
    ],
  },
  {
    label: "Sveikata",
    color: "bg-teal-700",
    textColor: "text-teal-700",
    hexColor: "#0f766e",
    items: [
      { id: "z", label: "Ligoninės", icon: Building2 },
      { id: "A", label: "Klinikos", icon: Stethoscope },
      { id: "B", label: "Odontologija", icon: Stethoscope },
      { id: "C", label: "Daktarai", icon: Doctor },
      { id: "D", label: "Vaistinės", icon: Pill },
    ],
  },
  {
    label: "Parduotuvės",
    color: "bg-indigo-700",
    textColor: "text-indigo-700",
    hexColor: "#4338ca",
    items: [
      { id: "E", label: "Prekybos centrai", icon: ShoppingBag },
      { id: "F", label: "Parduotuvės", icon: ShoppingCart },
      { id: "H", label: "Kioskai", icon: Store },
      { id: "I", label: "Pasidaryk pats", icon: Hammer },
      { id: "R", label: "Kitos parduotuvės", icon: ShoppingCart },
    ],
  },
  {
    label: "Religija",
    color: "bg-orange-700",
    textColor: "text-orange-700",
    hexColor: "#c2410c",
    items: [
      { id: "J", label: "Katalikų bažnyčios", icon: CrossIcon },
      { id: "K", label: "Evangelikų bažnyčios", icon: CrossIcon },
      { id: "L", label: "Cerkvės", icon: Church },
      { id: "M", label: "Kitų religijų maldos namai", icon: Church },
      { id: "X", label: "Vienuolynai", icon: Church },
    ],
  },
  {
    label: "Kontoros",
    color: "bg-slate-700",
    textColor: "text-slate-700",
    hexColor: "#334155",
    items: [
      { id: "N", label: "Valstybinės įstaigos", icon: Building },
      { id: "O", label: "Teismai", icon: Gavel },
      { id: "S", label: "Paštai", icon: Mail },
      { id: "P", label: "Notarai, antstoliai", icon: ScrollText },
      { id: "2", label: "Policija", icon: Shield },
      { id: "Q", label: "Kitos įmonės", icon: Briefcase },
    ],
  },
  {
    label: "Finansai",
    color: "bg-emerald-700",
    textColor: "text-emerald-700",
    hexColor: "#047857",
    items: [
      { id: "U", label: "Bankai", icon: Banknote },
      { id: "Y", label: "Draudimas", icon: Shield },
      { id: "V", label: "Bankomatai", icon: CreditCard },
    ],
  },
];
