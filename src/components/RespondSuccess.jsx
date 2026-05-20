import { CheckCircle2, Heart } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function RespondSuccess({ onClose }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-red-700/95 p-6">
      <div className="w-full max-w-sm text-center text-white animate-success-pop">
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20">
          <CheckCircle2 className="h-14 w-14 text-white" strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t("successTitle")}</h2>
        <p className="text-red-100 text-sm mb-1">{t("successText")}</p>
        <p className="text-xs text-red-200 mb-8 flex items-center justify-center gap-1">
          <Heart className="h-3.5 w-3.5 fill-white" /> {t("hospitalContact")}
        </p>
        <button type="button" onClick={onClose} className="w-full rounded-2xl bg-white py-3.5 text-sm font-bold text-red-700">
          OK
        </button>
      </div>
    </div>
  );
}
