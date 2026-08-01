import {
  LayoutDashboard,
  Link2,
  type LucideIcon,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  requiresModerate?: boolean;
}

export const DASHBOARD_MENU_ITEMS: DashboardNavItem[] = [
  { href: "/paskyra", label: "Apžvalga", icon: LayoutDashboard, exact: true },
  {
    href: "/paskyra/komentarai",
    label: "Mano komentarai",
    icon: MessageSquare,
  },
  {
    href: "/paskyra/komentarai/tvirtinimas",
    label: "Komentarų tvirtinimas",
    icon: ShieldCheck,
    requiresModerate: true,
  },
  { href: "/paskyra/prisijungimai", label: "Prisijungimo būdai", icon: Link2 },
];
