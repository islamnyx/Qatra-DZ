import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuthStore } from "../../store/authStore";

const TITLES = {
  "/dashboard": "Dashboard Overview",
  "/map": "GPS Hospital Map",
  "/nexus": "Nexus AI",
  "/inventory": "National Inventory",
  "/transfers": "Transfer Request Log",
  "/drives": "Donation Drives",
  "/analytics": "National Analytics",
  "/scanner": "Digital Passport Scanner",
  "/settings": "Settings",
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const touch = useAuthStore((s) => s.touch);

  useEffect(() => {
    const onActivity = () => touch();
    window.addEventListener("click", onActivity);
    window.addEventListener("keydown", onActivity);
    return () => {
      window.removeEventListener("click", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [touch]);

  const title = TITLES[location.pathname] || "BloodSync";

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className={`transition-all ${collapsed ? "ml-[60px]" : "ml-[240px]"}`}>
        <Navbar title={title} />
        <main className="min-h-[calc(100vh-4rem)] overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
