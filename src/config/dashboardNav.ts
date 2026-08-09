import {
  ImageIcon,
  LayoutDashboard,
  Link2,
  type LucideIcon,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { PERMISSIONS, type Permission } from "@/config/permissions";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  requiredPermission?: Permission;
  // Which pending-count bucket (see DashboardSidebar) to badge this item
  // with. Only meaningful together with requiredPermission.
  pendingCountKey?: "comments" | "photos";
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
    requiredPermission: PERMISSIONS.COMMENTS_MODERATE,
    pendingCountKey: "comments",
  },
  {
    href: "/paskyra/nuotraukos",
    label: "Mano nuotraukos",
    icon: ImageIcon,
  },
  {
    href: "/paskyra/nuotraukos/tvirtinimas",
    label: "Nuotraukų tvirtinimas",
    icon: ShieldCheck,
    requiredPermission: PERMISSIONS.PHOTOS_MODERATE,
    pendingCountKey: "photos",
  },
  { href: "/paskyra/prisijungimai", label: "Prisijungimo būdai", icon: Link2 },
];
