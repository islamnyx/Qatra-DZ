import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import NexusAI from "./pages/NexusAI";
import Inventory from "./pages/Inventory";
import Transfers from "./pages/Transfers";
import PlaceholderPage from "./pages/PlaceholderPage";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const user = useAuthStore((s) => s.user);
  const isSessionValid = useAuthStore((s) => s.isSessionValid);
  const getDefaultRoute = useAuthStore((s) => s.getDefaultRoute);

  return (
    <Routes>
      <Route path="/login" element={user && isSessionValid() ? <Navigate to={getDefaultRoute()} replace /> : <Login />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/nexus" element={<ProtectedRoute roles={["manager", "cra", "admin"]}><NexusAI /></ProtectedRoute>} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/transfers" element={<Transfers />} />
        <Route
          path="/drives"
          element={
            <ProtectedRoute roles={["cra"]}>
              <PlaceholderPage title="Donation Drive Scheduler" description="Calendar + map for CRA blood drives. Connect to POST /api/drives." />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute roles={["admin"]}>
              <PlaceholderPage title="National Analytics" description="Choropleth, monthly charts, export PDF/CSV." />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scanner"
          element={
            <ProtectedRoute roles={["medical"]}>
              <PlaceholderPage title="Digital Passport Scanner" description="QR scan → donor eligibility. Links to Qatra passport API." />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={<PlaceholderPage title="Settings" description="Notification preferences and webhook config (Admin)." />}
        />
      </Route>
      <Route path="/" element={<Navigate to={user && isSessionValid() ? getDefaultRoute() : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
