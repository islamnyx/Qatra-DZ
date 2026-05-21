import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { mockApi } from "../api/mockApi";

const TABS = ["Transfer Optimizer", "Shortage Alerts", "Expiry Prevention", "Demand Forecast"];

export default function NexusAI() {
  const [tab, setTab] = useState(0);
  const [recs, setRecs] = useState([]);
  const [shortages, setShortages] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [seasonal, setSeasonal] = useState([]);
  const [forecastData, setForecastData] = useState([]);

  useEffect(() => {
    mockApi.getRecommendations().then(setRecs);
    mockApi.getShortages().then(setShortages);
    mockApi.getExpiring(72).then(setExpiring);
    mockApi.getSeasonalFactors().then(setSeasonal);
    mockApi.getForecast("h1").then((f) => setForecastData(f.days));
  }, []);

  const expiryClass = (h) => {
    if (h < 24) return "bg-primary-light";
    if (h < 48) return "bg-amber-50";
    return "bg-yellow-50";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setTab(i)}
            className={`rounded-[10px] px-4 py-2 text-sm font-medium ${
              tab === i ? "bg-primary text-white" : "text-gray-600 hover:bg-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-4">
          <button type="button" className="btn-primary px-4 py-2 text-sm">
            Approve all critical transfers
          </button>
          {recs.map((rec) => (
            <div key={rec.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">{rec.action}</span>
                  <p className="mt-2 text-base font-medium">{rec.title}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    <span className="font-medium">{rec.fromWilaya}</span> →→→ <span className="font-medium">{rec.toWilaya}</span>
                  </p>
                  <p className="mt-2 text-xs">
                    <span className="rounded-full border border-border px-2 py-0.5 font-medium">{rec.bloodType}</span> · {rec.units} units · {rec.distanceKm} km
                    {rec.expiryHours && ` · Expires ${rec.expiryHours}h`}
                  </p>
                </div>
                <div className="w-32">
                  <p className="mb-1 text-xs text-gray-500">Urgency</p>
                  <div className="h-2 rounded-full bg-border overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${rec.urgency}%` }} />
                  </div>
                  <p className="mt-1 text-right text-xs font-medium">{rec.urgency}/100</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button type="button" className="btn-primary px-4 py-2 text-xs">Accept Transfer</button>
                <button type="button" className="rounded-[10px] border border-border px-4 py-2 text-xs">Dismiss</button>
                <button type="button" className="rounded-[10px] border border-border px-4 py-2 text-xs">Details</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 1 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-gray-500">
              <tr>
                <th className="p-3">Hospital</th>
                <th className="p-3">Wilaya</th>
                <th className="p-3">Deficit types</th>
                <th className="p-3">Days until empty</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shortages.map((row, i) => (
                <tr key={i} className={`border-t border-border ${row.daysUntilEmpty < 1 ? "bg-primary-light" : ""}`}>
                  <td className="p-3 font-medium">{row.hospital}</td>
                  <td className="p-3">{row.wilaya}</td>
                  <td className="p-3">{row.types.join(", ")}</td>
                  <td className="p-3 font-medium text-danger">{row.daysUntilEmpty}d</td>
                  <td className="p-3">
                    <button type="button" onClick={() => mockApi.broadcastAlert()} className="mr-2 text-xs text-primary font-medium">
                      Broadcast alert
                    </button>
                    <button type="button" className="text-xs text-gray-600">Emergency transfer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 2 && (
        <div className="space-y-3">
          <button type="button" className="btn-primary px-4 py-2 text-sm">Approve selected transfers</button>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface text-xs text-gray-500">
                <tr>
                  <th className="p-3 w-8"><input type="checkbox" /></th>
                  <th className="p-3 text-left">Hospital</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Units</th>
                  <th className="p-3">Hours left</th>
                  <th className="p-3">Suggested dest.</th>
                </tr>
              </thead>
              <tbody>
                {expiring.map((row, i) => (
                  <tr key={i} className={`border-t border-border ${expiryClass(row.hoursRemaining)}`}>
                    <td className="p-3"><input type="checkbox" /></td>
                    <td className="p-3">{row.hospital}</td>
                    <td className="p-3 font-medium">{row.type}</td>
                    <td className="p-3">{row.units}</td>
                    <td className="p-3 font-medium">{row.hoursRemaining}h</td>
                    <td className="p-3 text-xs">{row.suggestedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 3 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card lg:col-span-2 p-5">
            <h3 className="mb-4 text-sm font-medium">30-day demand forecast</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="A+" stroke="#C42B2B" strokeWidth={2} />
                  <Line type="monotone" dataKey="O-" stroke="#1D9E75" strokeWidth={2} />
                  <Line type="monotone" dataKey="B+" stroke="#EF9F27" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <button type="button" onClick={() => window.print()} className="mt-4 rounded-[10px] border border-border px-4 py-2 text-sm">
              Export PDF (print)
            </button>
          </div>
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-medium">Seasonal factors</h3>
            <div className="space-y-3">
              {seasonal.map((s) => (
                <div key={s.event} className="rounded-[10px] border border-border p-3 text-xs">
                  <p className="font-medium">{s.event}</p>
                  <p className="text-gray-500 mt-1">{s.range}</p>
                  <p className="mt-1">{s.adjustments}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] text-gray-400">Admin: edit via PUT /api/seasonal-factors (backend)</p>
          </div>
        </div>
      )}
    </div>
  );
}
