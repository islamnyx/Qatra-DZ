import { X, HeartPulse, Shield } from "lucide-react";
import BloodTypeBadge from "../../../components/BloodTypeBadge";
import { useLanguage } from "../../../context/LanguageContext";

export default function EmergencySheet({ alert, onClose, onCanHelp, helped }) {
  const { t, lang } = useLanguage();
  if (!alert) return null;

  const hospital = lang === "fr" ? alert.hospitalFr : alert.hospitalAr;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-3xl border border-orange-200 bg-white p-5 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-orange-600 animate-pulse" />
            <h2 className="text-lg font-bold text-orange-800">{t("mapEmergency")}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <BloodTypeBadge type={alert.bloodType} />
        <p className="mt-3 font-bold text-gray-900">{hospital}</p>
        <p className="text-xs text-gray-500">{alert.wilaya}</p>
        <p className="mt-2 text-xs font-semibold text-orange-700 uppercase">
          {alert.urgency === "critical" ? t("mapUrgencyCritical") : t("mapUrgencyNormal")}
        </p>

        <p className="mt-3 flex items-start gap-2 rounded-xl border border-orange-100 bg-orange-50 p-3 text-xs text-gray-700">
          <Shield className="h-4 w-4 shrink-0 text-orange-600 mt-0.5" />
          {t("mapEmergencyPrivacy")}
        </p>

        <button
          type="button"
          disabled={helped}
          onClick={onCanHelp}
          className="mt-4 w-full rounded-2xl bg-orange-600 py-3.5 text-sm font-bold text-white min-h-[52px] disabled:opacity-60 sos-glow active:scale-[0.98]"
        >
          {helped ? t("mapCanHelpDone") : t("mapCanHelp")}
        </button>
      </div>
    </div>
  );
}
