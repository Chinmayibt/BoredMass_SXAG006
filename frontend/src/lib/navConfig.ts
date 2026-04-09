import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  Settings,
  MessageSquare,
  Map as MapIcon,
  Mic,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Workspace", to: "/workspace", icon: LayoutDashboard },
  { label: "Reports", to: "/reports", icon: FileText },
  { label: "Settings", to: "/settings", icon: Settings },
];

export const AGENT_NAV_ITEMS: NavItem[] = [
  { label: "Debate agent", to: "/debate", icon: MessageSquare },
  { label: "Roadmap agent", to: "/roadmap", icon: MapIcon },
  { label: "Podcast agent", to: "/podcast", icon: Mic },
];
