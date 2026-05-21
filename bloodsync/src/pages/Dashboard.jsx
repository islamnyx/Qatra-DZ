import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { AlertTriangle, Package, Clock, Truck } from "lucide-react";
import { api } from "../api";
import { getStockUrgency } from "../mock/data";

function KpiCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-12 w-12 items-center justify-center rounded-[10px] ${accent}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-medium text-gray-800">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    Promise.all([api.getNationalKpis(), api.getHospitals(), api.getRecommendations()]).then(
      ([k, h, r]) => {
        setKpis(k);
        setHospitals(h);
        setRecs(r);
      }
    );
  }, []);

  const urgent = [...hospitals].sort((a, b) => a.stockLevel - b.stockLevel).slice(0, 5);

  if (!kpis) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Package} label="National units in stock" value={kpis.totalUnits} accent="bg-primary-light text-primary" />
        <KpiCard icon={Clock} label="Expiring this week" value={kpis.expiringThisWeek} accent="bg-amber-50 text-warning" />
        <KpiCard icon={AlertTriangle} label="Active shortages" value={kpis.activeShortages} accent="bg-primary-light text-danger" />
        <KpiCard icon={Truck} label="Transfers completed today" value={kpis.transfersToday} accent="bg-green-50 text-success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden p-0">
          <div className="border-b border-border px-4 py-3 flex justify-between items-center">
            <h2 className="text-sm font-medium">National overview map</h2>
            <Link to="/map" className="text-xs text-primary font-medium">Open full map →</Link>
          </div>
          <div className="h-64">
            <MapContainer center={[36.7538, 3.0588]} zoom={5} className="h-full w-full" scrollWheelZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {hospitals.map((h) => {
                const u = getStockUrgency(h.stockLevel);
                return (
                  <CircleMarker
                    key={h.id}
                    center={h.coordinates}
                    radius={8 + h.capacity / 200}
                    pathOptions={{ color: u.color, fillColor: u.color, fillOpacity: 0.7 }}
                  >
                    <Popup>{h.name}</Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-medium">Top 5 urgent hospitals</h2>
          <ul className="space-y-3">
            {urgent.map((h) => {
              const u = getStockUrgency(h.stockLevel);
              return (
                <li key={h.id} className="flex items-center justify-between rounded-[10px] border border-border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{h.name}</p>
                    <p className="text-xs text-gray-500">{h.wilaya}</p>
                  </div>
                  <span className="text-xs font-medium" style={{ color: u.color }}>
                    {Math.round(h.stockLevel * 100)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium">Recent AI recommendations</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {recs.map((rec) => (
            <div key={rec.id} className="card min-w-[280px] shrink-0 p-4">
              <p className="text-xs font-medium text-primary">{rec.action}</p>
              <p className="mt-1 text-sm font-medium">{rec.title}</p>
              <p className="mt-2 text-xs text-gray-500">
                {rec.fromWilaya} → {rec.toWilaya} · {rec.bloodType}
              </p>
              <p className="mt-1 text-xs">Urgency {rec.urgency}/100</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
