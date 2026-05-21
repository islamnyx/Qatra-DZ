import { X, Building2 } from "lucide-react";
import BloodTypeBadge from "../../../components/BloodTypeBadge";
import { useLanguage } from "../../../context/LanguageContext";

export default function WilayaSheet({ wilaya, onClose }) {
  const { t } = useLanguage();
  if (!wilaya) return null;
  const isCritical = wilaya.status === "critical";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-t-3xl border border-red-100 bg-white p-5 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{wilaya.nameAr}</h2>
            <p className="text-xs text-gray-500">{wilaya.name}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-red-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className={`rounded-2xl border p-3 mb-4 ${isCritical ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
          <p className={`text-sm font-bold ${isCritical ? "text-red-700" : "text-green-700"}`}>
            {isCritical ? t("critical") : t("ok")}
          </p>
          {wilaya.shortage && (
            <div className="mt-2">
              <BloodTypeBadge type={wilaya.shortage} />
            </div>
          )}
        </div>
        <p className="text-xs font-semibold text-gray-500 mb-2">{t("hospitals")}</p>
        <ul className="space-y-2">
          {(wilaya.hospitals ?? []).map((h) => (
            <li key={h} className="flex items-center gap-2 rounded-xl border border-red-50 bg-red-50/50 px-3 py-2 text-sm">
              <Building2 className="h-4 w-4 text-red-600 shrink-0" />
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
