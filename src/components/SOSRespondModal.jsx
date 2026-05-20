import { useState } from "react";
import { X, Clock, MapPin, Droplet } from "lucide-react";
import BloodTypeBadge from "./BloodTypeBadge";
import { useLanguage } from "../context/LanguageContext";

const ETAS = ["15 min", "30 min", "45 min"];

export default function SOSRespondModal({ request, matchScore, onClose, onConfirm }) {
  const { t } = useLanguage();
  const [eta, setEta] = useState(ETAS[0]);
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-t-3xl border border-red-100 bg-white p-5 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-red-700">{t("respondConfirm")}</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-red-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <BloodTypeBadge type={request.bloodType} />
            <span className="text-sm font-bold text-red-700">{matchScore}% {t("matchLabel")}</span>
          </div>
          <p className="font-semibold text-gray-900 text-sm">{request.hospital}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" /> {request.wilaya}
          </p>
        </div>
        <p className="text-sm text-gray-600 mb-4">{t("respondConfirmText")}</p>
        <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> {t("eta")}
        </p>
        <div className="flex gap-2 mb-5">
          {ETAS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEta(e)}
              className={`flex-1 rounded-xl border py-2 text-sm font-semibold ${
                eta === e ? "border-red-600 bg-red-600 text-white" : "border-red-100 text-gray-600"
              }`}
            >
              {e}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onConfirm(eta)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3.5 text-sm font-bold text-white"
        >
          <Droplet className="h-4 w-4 fill-white" />
          {t("confirm")}
        </button>
        <button type="button" onClick={onClose} className="w-full mt-2 py-2 text-sm text-gray-500">
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}
