import { NavLink, useLocation } from "react-router-dom";
import { Home, Map, MessageCircle, Newspaper, User } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { to: "/", label: t("home"), icon: Home },
    { to: "/map", label: t("map"), icon: Map },
    { to: "/chat", label: "DamBot", icon: MessageCircle, center: true },
    { to: "/feed", label: t("feed"), icon: Newspaper },
    { to: "/profile", label: t("profile"), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-red-100 bg-white">
      <div className="mx-auto flex max-w-sm items-end justify-around px-2 pb-2 pt-1">
        {navItems.map(({ to, label, icon: Icon, center }) => {
          const active = location.pathname === to;
          if (center) {
            return (
              <NavLink key={to} to={to} className="flex flex-col items-center -mt-5">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${active ? "bg-red-700" : "bg-red-600"}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className={`mt-1 text-xs font-medium ${active ? "text-red-600" : "text-gray-400"}`}>{label}</span>
              </NavLink>
            );
          }
          return (
            <NavLink key={to} to={to} className="flex flex-col items-center py-1 min-w-[52px]">
              <Icon className={`h-5 w-5 ${active ? "text-red-600" : "text-gray-400"}`} />
              <span className={`text-[10px] font-medium ${active ? "text-red-600" : "text-gray-400"}`}>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
