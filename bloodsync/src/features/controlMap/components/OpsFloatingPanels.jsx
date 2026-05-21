import { AlertTriangle, Radio, MapPinned, Trash2 } from "lucide-react";
import { BLOOD_TYPES_FILTER } from "../api/controlMapApi";

export function ExpiryPanel({ expiry, onClose, onSuggestTransfer }) {
  if (!expiry) return null;
  const days = expiry.daysUntilExpiry;
  const first = expiry.items[0];

  return (
    <div className="ops-panel-float absolute bottom-20 left-3 z-[500] w-72 rounded-xl p-4 shadow-xl animate-scale-in">
      <div className="flex justify-between items-start mb-2">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <button type="button" onClick={onClose} className="text-slate-500 text-xs">
          Close
        </button>
      </div>
      <p className="text-sm font-bold text-orange-300">
        ⚠️ {expiry.units} unit(s) expiring within 5 days
      </p>
      <p className="text-xs text-slate-400 mt-1">{expiry.hospital.name}</p>
      {first?.suggestedTo && (
        <button
          type="button"
          onClick={() => onSuggestTransfer?.(expiry, first)}
          className="mt-3 w-full rounded-lg bg-orange-700/80 py-2 text-xs font-semibold text-white hover:bg-orange-600"
        >
          نقل إلى {first.suggestedTo}
          {first.distanceKm != null ? ` — ${first.distanceKm} km` : ""}
        </button>
      )}
    </div>
  );
}

export function PlannerPanel({
  polygon,
  analysis,
  onClear,
  onAnalyze,
  onDeploy,
  deploying,
}) {
  if (!polygon?.length) return null;
  return (
    <div className="ops-panel-float absolute bottom-20 right-[400px] z-[500] w-80 rounded-xl p-4 shadow-xl">
      <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
        <MapPinned className="h-4 w-4" /> Drive deployment zone ({polygon.length} points)
      </p>
      {analysis ? (
        <div className="mt-2 text-xs text-slate-300 space-y-1">
          <p>
            Eligible donors in zone: <strong className="text-white">{analysis.donorCount}</strong> (anonymous aggregate)
          </p>
          <p>
            Optimal spot: <strong className="text-white">{analysis.optimalLabel}</strong>
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-500">Click Analyze to estimate donor density in polygon.</p>
      )}
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onAnalyze} className="flex-1 rounded-lg border border-[#475569] py-1.5 text-xs text-slate-200">
          Analyze zone
        </button>
        <button
          type="button"
          disabled={!analysis || deploying}
          onClick={onDeploy}
          className="flex-1 rounded-lg bg-emerald-700 py-1.5 text-xs font-bold text-white disabled:opacity-50"
        >
          {deploying ? "…" : "Deploy drive"}
        </button>
        <button type="button" onClick={onClear} className="rounded-lg border border-[#475569] p-1.5 text-slate-400">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function BroadcastPanel({
  center,
  radiusKm,
  onRadius,
  bloodType,
  onBloodType,
  estimatedReach,
  onBroadcast,
  broadcasting,
  onClose,
}) {
  if (!center) return null;
  return (
    <div className="ops-panel-float absolute bottom-20 left-3 z-[500] w-80 rounded-xl p-4 shadow-xl">
      <div className="flex justify-between mb-2">
        <p className="text-xs font-semibold text-red-400 flex items-center gap-1">
          <Radio className="h-4 w-4" /> Regional alert broadcast
        </p>
        <button type="button" onClick={onClose} className="text-xs text-slate-500">
          Close
        </button>
      </div>
      <label className="text-[10px] text-slate-500 block mb-1">Blood type</label>
      <select
        value={bloodType}
        onChange={(e) => onBloodType(e.target.value)}
        className="w-full mb-2 bg-[#1a2332] border border-[#334155] rounded-lg text-xs text-slate-200 p-1.5"
      >
        {BLOOD_TYPES_FILTER.filter((t) => t !== "Platelets").map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <label className="text-[10px] text-slate-500">
        Radius: {radiusKm} km
      </label>
      <input
        type="range"
        min={5}
        max={80}
        value={radiusKm}
        onChange={(e) => onRadius(Number(e.target.value))}
        className="w-full accent-red-600"
      />
      <p className="mt-2 text-sm text-amber-200/90 font-medium">
        هذا التنبيه سيصل إلى ~{estimatedReach} متبرع مؤهل
      </p>
      <p className="text-[10px] text-slate-500 mt-1">Anonymous SMS/push — CRA mediated</p>
      <button
        type="button"
        disabled={broadcasting}
        onClick={onBroadcast}
        className="mt-3 w-full rounded-lg bg-red-700 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        {broadcasting ? "Broadcasting…" : "Broadcast alert"}
      </button>
    </div>
  );
}

export function RareClusterPanel({ cluster, onClose, onAlert, alerting }) {
  if (!cluster) return null;
  return (
    <div className="ops-panel-float absolute top-32 right-3 z-[500] w-64 rounded-xl p-3 shadow-xl">
      <p className="text-xs font-bold text-violet-300">{cluster.phenotype} — {cluster.wilaya}</p>
      <p className="text-sm text-white mt-1">{cluster.count} registered donors (aggregate)</p>
      <button
        type="button"
        disabled={alerting}
        onClick={onAlert}
        className="mt-2 w-full rounded-lg bg-violet-700 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        {alerting ? "…" : "Broadcast to rare phenotype"}
      </button>
      <button type="button" onClick={onClose} className="mt-1 text-[10px] text-slate-500 w-full">
        Close
      </button>
    </div>
  );
}

export function DriveAnalyticsPanel({ drive, onClose }) {
  if (!drive) return null;
  const perf =
    drive.performance === "exceeded"
      ? "Exceeded target"
      : drive.performance === "met"
        ? "Met target"
        : "Underperformed";
  return (
    <div className="ops-panel-float absolute top-32 right-3 z-[500] w-72 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-slate-400">Completed drive</p>
      <p className="text-sm font-bold text-white">{drive.name}</p>
      <p className="text-xs text-slate-300 mt-2">
        Donors: {drive.donorsCame} / {drive.targetDonors} · Efficiency {(drive.efficiency * 100).toFixed(0)}%
      </p>
      <p className={`text-xs font-bold mt-1 ${drive.performance === "exceeded" ? "text-green-400" : drive.performance === "met" ? "text-yellow-400" : "text-red-400"}`}>
        {perf}
      </p>
      <ul className="mt-2 text-[10px] text-slate-400">
        {Object.entries(drive.unitsCollected).map(([t, u]) => (
          <li key={t}>
            {t}: {u} units
          </li>
        ))}
      </ul>
      <button type="button" onClick={onClose} className="mt-2 text-[10px] text-slate-500">
        Close
      </button>
    </div>
  );
}
