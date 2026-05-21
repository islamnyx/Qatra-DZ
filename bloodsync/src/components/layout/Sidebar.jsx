import { NavLink } from "react-router-dom";
import { Droplet, PanelLeftClose, PanelLeft } from "lucide-react";
import { NAV_ITEMS } from "../../config/nav";
import { useAuthStore, ROLE_LABELS } from "../../store/authStore";

export default function Sidebar({ collapsed, onToggle }) {
  const user = useAuthStore((s) => s.user);
  const items = NAV_ITEMS.filter((n) => n.roles.includes(user?.role));

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-full flex-col border-r border-border bg-white transition-all duration-200 ${
        collapsed ? "w-[60px]" : "w-[240px]"
      }`}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-white">
          <Droplet className="h-5 w-5 fill-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-primary">BloodSync</p>
            <p className="text-[10px] text-gray-500 leading-tight">Nexus de Distribution</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {items.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-primary-light text-primary" : "text-gray-600 hover:bg-surface"
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        {!collapsed && user && (
          <div className="mb-2 rounded-[10px] bg-surface px-3 py-2">
            <p className="text-xs font-medium truncate">{user.name}</p>
            <span className="mt-1 inline-block rounded-full bg-primary-light px-2 py-0.5 text-[10px] font-medium text-primary">
              {ROLE_LABELS[user.role]?.split(" ")[0] ?? user.role}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-[10px] border border-border py-2 text-gray-500 hover:bg-surface"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
