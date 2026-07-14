import {
  Compass,
  Cpu,
  Heart,
  Info,
  Layers,
  type LucideIcon,
  Mail,
} from "lucide-react";

export interface NavMenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const MENU_ITEMS: NavMenuItem[] = [
  { href: "/bendra-informacija", label: "Bendra informacija", icon: Info },
  { href: "/katalogas", label: "Katalogas", icon: Compass },
  { href: "/zemelapio-duomenys", label: "Žemėlapio duomenys", icon: Layers },
  { href: "/technine-informacija", label: "Techninė informacija", icon: Cpu },
  { href: "/kontaktai", label: "Kontaktai", icon: Mail },
  { href: "/prisidekite", label: "Prisidėkite!", icon: Heart },
];
