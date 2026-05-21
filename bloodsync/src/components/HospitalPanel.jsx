import { X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getStockUrgency } from "../mock/data";

function fillClass(ratio) {
  if (ratio >= 0.7) return "text-success bg-green-50";
  if (ratio >= 0.3) return "text-warning bg-amber-50";
  return "text-danger bg-primary-light";
}

export default function HospitalPanel({ hospital, forecast, recommendations, onClose, onAccept, onDismiss }) {
  if (!hospital) return null;
  const urgency = getStockUrgency(hospital.stockLevel);
  const hospitalRecs = recommendations?.filter(
    (r) => r.toHospital === hospital.name || r.fromHospital === hospital.name
  ).slice(0, 3);

  return (
    <div className="fixed right-0 top-0 z-[1000] flex h-full w-[400px] flex-col border-l border-border bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-border p-5">
        <div>
          <h2 className="text-base font-medium">{hospital.name}</h2>
          <div className="mt-2 flex gap-2">
            <span className="rounded-full bg-surface px-2 py-0.5 text-xs">{hospital.wilaya}</span>
            <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white" style={{ background: urgency.color }}>
              {urgency.label}
            </span>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-[10px] border border-border p-2">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Inventory</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-gray-500">
                <th className="pb-2">Type</th>
                <th>Units</th>
                <th>Opt.</th>
                <th>Trend</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {hospital.stock.map((row) => (
                <tr key={row.type} className="border-b border-border/60">
                  <td className="py-2 font-medium">{row.type}</td>
                  <td className={`py-2 rounded px-1 ${fillClass(row.fillRatio)}`}>{row.units}</td>
                  <td className="py-2 text-gray-500">{row.optimal}</td>
                  <td className="py-2">{row.trend}</td>
                  <td className="py-2 text-danger">{row.expiryAlert ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {forecast && (
          <section>
            <h3 className="mb-1 text-xs font-medium uppercase text-gray-500">Demand forecast (7d)</h3>
            <p className="mb-2 text-[11px] text-primary">{forecast.context}</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecast.days}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="O-" fill="#C42B2B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="A+" fill="#F0E0E0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {hospitalRecs?.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-medium uppercase text-gray-500">AI recommendations</h3>
            <div className="space-y-2">
              {hospitalRecs.map((rec) => (
                <div key={rec.id} className="card p-3">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {rec.fromWilaya} → {rec.toWilaya} · {rec.bloodType} · {rec.units} units
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => onAccept?.(rec)} className="btn-primary px-3 py-1.5 text-xs">
                      Accept
                    </button>
                    <button type="button" onClick={() => onDismiss?.(rec)} className="rounded-[10px] border border-border px-3 py-1.5 text-xs">
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
