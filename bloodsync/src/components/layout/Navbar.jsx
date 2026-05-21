import { useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { mockApi } from "../../api/mockApi";

export default function Navbar({ title }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotif = async () => {
    if (!notifOpen) setNotifications(await mockApi.getNotifications());
    setNotifOpen(!notifOpen);
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-white px-6">
      <h1 className="text-lg font-medium text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={loadNotif}
            className="relative flex h-10 w-10 items-center justify-center rounded-[10px] border border-border hover:bg-surface"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-12 w-[360px] rounded-[16px] border border-border bg-white p-4 shadow-card">
              <p className="mb-3 text-sm font-medium">Notifications</p>
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className={`rounded-[10px] p-2 text-xs ${n.type === "critical" ? "bg-primary-light" : "bg-surface"}`}>
                    {n.message}
                    <span className="mt-1 block text-gray-400">{n.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <span className="text-sm text-gray-600">{user?.name}</span>
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1 rounded-[10px] border border-border px-3 py-2 text-sm text-gray-600 hover:bg-surface"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </header>
  );
}
