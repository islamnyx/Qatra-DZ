import {
  LayoutDashboard,
  Map,
  Sparkles,
  Table2,
  ArrowLeftRight,
  Calendar,
  BarChart3,
  ScanLine,
  Settings,
  Siren,
} from "lucide-react";

export const NAV_ITEMS = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard, roles: ["manager", "cra", "admin", "medical"] },
  { path: "/map", label: "Map", icon: Map, roles: ["manager", "cra", "admin", "medical"] },
  { path: "/nexus", label: "Nexus AI", icon: Sparkles, roles: ["manager", "cra", "admin"] },
  { path: "/inventory", label: "Inventory", icon: Table2, roles: ["manager", "cra", "admin"] },
  { path: "/requests", label: "SOS Requests", icon: Siren, roles: ["manager", "cra", "admin", "medical"] },
  { path: "/transfers", label: "Transfers", icon: ArrowLeftRight, roles: ["manager", "cra", "admin", "medical"] },
  { path: "/drives", label: "Drives", icon: Calendar, roles: ["cra"] },
  { path: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin"] },
  { path: "/scanner", label: "Scanner", icon: ScanLine, roles: ["medical"] },
  { path: "/settings", label: "Settings", icon: Settings, roles: ["manager", "cra", "admin", "medical"] },
];
