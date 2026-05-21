import { X, Send, Clock, BedDouble } from "lucide-react";
import { getStockUrgency } from "../../../mock/data";

function fillClass(ratio) {
  if (ratio >= 0.7) return "text-emerald-400 bg-emerald-950";
  if (ratio >= 0.3) return "text-amber-400 bg-amber-950";
  return "text-red-400 bg-red-950";
}

export default function ControlHospitalSidebar({
  hospital,
  recommendations,
  onClose,
  onTransferRequest,
  transferPending,
}) {
  if (!hospital) return null;
  const urgency = getStockUrgency(hospital.stockLevel);
  const hospitalRecs = recommendations?.filter(
    (r) => r.toHospital === hospital.name || r.fromHospital === hospital.name
  ).slice(0, 2);
  const updated = hospital.lastUpdated
    ? new Date(hospital.lastUpdated).toLocaleString("fr-DZ")
    : "—";

  return (
    <div className="ops-sidebar fixed right-0 top-0 z-[1000] flex h-full w-[380px] flex-col shadow-2xl">
      <div className="flex items-start justify-between border-b border-[#2a3441] p-4">
        <div>
          <h2 className="text-sm font-semibold text-white">{hospital.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{hospital.wilaya}</p>
          <span
            className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ background: urgency.color }}
          >
            {urgency.label}
          </span>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg border border-[#334155] p-2 text-slate-300 hover:bg-[#1a2332]">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        <div className="flex gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Updated {updated}
          </span>
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" />
            {hospital.bedsUsed ?? "—"}/{hospital.bedsTotal ?? "—"} beds
          </span>
        </div>

        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Inventory (8 types)
          </h3>
          <table className="ops-table w-full">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="pb-1">Type</th>
                <th>Units</th>
                <th>Opt.</th>
                <th>Exp.</th>
              </tr>
            </thead>
            <tbody>
              {hospital.stock.map((row) => (
                <tr key={row.type} className="border-t border-[#2a3441]">
                  <td className="py-1.5 font-medium text-slate-200">{row.type}</td>
                  <td className={`py-1.5 px-1 rounded ${fillClass(row.fillRatio)}`}>{row.units}</td>
                  <td className="py-1.5 text-slate-500">{row.optimal}</td>
                  <td className="py-1.5 text-orange-400">{row.expiryAlert ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <p className="text-slate-500">
          Storage capacity index: <strong className="text-slate-200">{hospital.capacity}</strong> units nominal
        </p>

        {hospitalRecs?.length > 0 && (
          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase text-slate-500">Suggested actions</h3>
            {hospitalRecs.map((rec) => (
              <div key={rec.id} className="mb-2 rounded-lg border border-[#334155] bg-[#1a2332] p-2">
                <p className="text-slate-200 font-medium">{rec.title}</p>
                <p className="text-slate-500 mt-1">
                  {rec.bloodType} · {rec.units} units · {rec.distanceKm} km
                </p>
              </div>
            ))}
          </section>
        )}

        <button
          type="button"
          disabled={transferPending}
          onClick={() => onTransferRequest?.(hospital)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-700 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {transferPending ? "Sending…" : "Send Transfer Request"}
        </button>
      </div>
    </div>
  );
}
