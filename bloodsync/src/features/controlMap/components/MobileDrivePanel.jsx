import { X, QrCode } from "lucide-react";

export default function MobileDrivePanel({ drive, onClose, onFlyTo }) {
  if (!drive) return null;

  return (
    <div className="ops-panel-float absolute top-32 right-3 z-[500] w-72 rounded-xl p-3 shadow-xl animate-scale-in">
      <div className="flex justify-between items-start">
        <p className="text-xs text-slate-400">Mobile drive</p>
        <button type="button" onClick={onClose} className="text-slate-500">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="text-sm font-bold text-white mt-1">{drive.name}</p>
      <p className="text-xs text-slate-400 mt-1">
        {drive.wilaya} · Status:{" "}
        <span
          className={
            drive.status === "live"
              ? "text-green-400"
              : drive.status === "planned"
                ? "text-amber-400"
                : "text-slate-300"
          }
        >
          {drive.status}
        </span>
      </p>
      {drive.plannedDonors != null && (
        <p className="text-xs text-slate-300 mt-2">Target: {drive.plannedDonors} donors</p>
      )}
      {drive.qrEnabled && (
        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
          <QrCode className="h-3.5 w-3.5" /> QR check-in enabled
        </p>
      )}
      <button
        type="button"
        onClick={() => onFlyTo?.(drive.coordinates)}
        className="mt-3 w-full rounded-lg border border-[#475569] py-2 text-xs font-semibold text-slate-200 hover:bg-[#1a2332]"
      >
        Center map on drive
      </button>
    </div>
  );
}
