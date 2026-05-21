import { Lock, Sparkles } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

export default function EligibilityBanner({ isEligible, daysUntilEligible }) {
  const { t } = useLanguage();

  if (isEligible) {
    return (
      <div className="mx-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-3 shadow-sm">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white text-lg font-bold animate-pulse">
          ✓
        </span>
        <div>
          <p className="font-bold text-green-800">{t("mapReady")}</p>
          <p className="text-xs text-green-700">{t("mapReadyHint")}</p>
        </div>
        <Sparkles className="h-5 w-5 text-amber-500 ms-auto shrink-0" />
      </div>
    );
  }

  return (
    <div className="mx-4 rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-500 text-white">
        <Lock className="h-5 w-5" />
      </span>
      <div>
        <p className="font-bold text-gray-800 text-sm">
          {t("mapCooldown")} {daysUntilEligible} {t("days")}
        </p>
        <p className="text-xs text-gray-600">{t("mapCooldownHint")}</p>
      </div>
    </div>
  );
}
