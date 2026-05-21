import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { Search } from "lucide-react";
import { mockApi } from "../api/mockApi";
import { getStockUrgency } from "../mock/data";
import HospitalPanel from "../components/HospitalPanel";

export default function MapView() {
  const [hospitals, setHospitals] = useState([]);
  const [selected, setSelected] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [wilayaFilter, setWilayaFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showDrives, setShowDrives] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);

  useEffect(() => {
    mockApi.getHospitals().then(setHospitals);
    mockApi.getRecommendations().then(setRecommendations);
  }, []);

  useEffect(() => {
    if (selected) {
      mockApi.getForecast(selected.id).then(setForecast);
    } else {
      setForecast(null);
    }
  }, [selected]);

  const wilayas = useMemo(() => [...new Set(hospitals.map((h) => h.wilaya))], [hospitals]);

  const filtered = hospitals.filter((h) => {
    if (filter === "critical" && h.stockLevel >= 0.3) return false;
    if (filter === "expiry" && !h.hasExpiryRisk) return false;
    if (wilayaFilter && h.wilaya !== wilayaFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return h.name.toLowerCase().includes(q) || h.wilaya.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="relative -m-6 h-[calc(100vh-4rem)]">
      <div className="absolute left-4 top-4 z-[500] flex flex-wrap gap-2">
        <div className="card flex flex-wrap items-center gap-2 p-3">
          <select className="input-field w-auto text-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All hospitals</option>
            <option value="critical">Critical only</option>
            <option value="expiry">Expiry risk</option>
          </select>
          <select className="input-field w-auto text-xs" value={wilayaFilter} onChange={(e) => setWilayaFilter(e.target.value)}>
            <option value="">All wilayas</option>
            {wilayas.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={showDrives} onChange={(e) => setShowDrives(e.target.checked)} />
            Donation sites
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input type="checkbox" checked={showRoutes} onChange={(e) => setShowRoutes(e.target.checked)} />
            Transfer routes
          </label>
        </div>
        <div className="card flex items-center gap-2 px-3 py-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            className="border-0 bg-transparent text-sm outline-none w-40"
            placeholder="Hospital or wilaya"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <MapContainer center={[36.7538, 3.0588]} zoom={6} className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {filtered.map((h) => {
          const u = getStockUrgency(h.stockLevel);
          const radius = 10 + (h.capacity / 150);
          return (
            <CircleMarker
              key={h.id}
              center={h.coordinates}
              radius={radius}
              pathOptions={{
                color: u.color,
                fillColor: u.color,
                fillOpacity: 0.75,
                weight: h.hasExpiryRisk ? 3 : 2,
                className: h.hasExpiryRisk ? "marker-pulse" : "",
              }}
              eventHandlers={{ click: () => setSelected(h) }}
            >
              <Popup>
                <strong>{h.name}</strong>
                <br />
                {h.wilaya} — {u.label}
              </Popup>
            </CircleMarker>
          );
        })}
        {showDrives && (
          <CircleMarker center={[36.77, 3.05]} radius={8} pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.8 }}>
            <Popup>CRA Drive — Alger Centre</Popup>
          </CircleMarker>
        )}
      </MapContainer>

      {selected && (
        <HospitalPanel
          hospital={selected}
          forecast={forecast}
          recommendations={recommendations}
          onClose={() => setSelected(null)}
          onAccept={() => setSelected(null)}
          onDismiss={() => {}}
        />
      )}
    </div>
  );
}
