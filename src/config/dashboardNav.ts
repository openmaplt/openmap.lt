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
  // Undefined = personal section (own content). "admin" groups the
  // permission-gated moderation queues under their own sidebar heading,
  // separate from "my content" — see DashboardSidebar.
  section?: "admin";
}

export const DASHBOARD_MENU_ITEMS: DashboardNavItem[] = [
  { href: "/paskyra", label: "Apžvalga", icon: LayoutDashboard, exact: true },
  {
    href: "/paskyra/komentarai",
    label: "Mano komentarai",
    icon: MessageSquare,
  },
  {
    href: "/paskyra/nuotraukos",
    label: "Mano nuotraukos",
    icon: ImageIcon,
  },
  { href: "/paskyra/prisijungimai", label: "Prisijungimo būdai", icon: Link2 },
  {
    href: "/paskyra/komentarai/tvirtinimas",
    label: "Komentarų tvirtinimas",
    icon: ShieldCheck,
    requiredPermission: PERMISSIONS.COMMENTS_MODERATE,
    pendingCountKey: "comments",
    section: "admin",
  },
  {
    href: "/paskyra/nuotraukos/tvirtinimas",
    label: "Nuotraukų tvirtinimas",
    icon: ShieldCheck,
    requiredPermission: PERMISSIONS.PHOTOS_MODERATE,
    pendingCountKey: "photos",
    section: "admin",
  },
];
