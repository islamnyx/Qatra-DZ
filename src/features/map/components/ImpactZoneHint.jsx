import { useMemo } from "react";
import { Heart, Sparkles } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { buildImpactSnapshot } from "../utils/impactZone.js";

/** Emotional impact panel for feature 2.7 — scales with totalDonations. */
export default function ImpactZoneHint({ visible, totalDonations = 0 }) {
  const { t, lang } = useLanguage();

  const snap = useMemo(
    () => buildImpactSnapshot(totalDonations, lang),
    [totalDonations, lang]
  );

  if (!visible) return null;

  const headlineKey =
    snap.livesSaved > 0 ? "mapImpactLivesHeadline" : "mapImpactSeedHeadline";
  const bodyKey =
    snap.donations === 0
      ? "mapImpactSeedBody"
      : snap.atMaxRadius
        ? "mapImpactMaxBody"
        : "mapImpactGrowBody";

  return (
    <div
      className={`impact-zone-panel impact-zone-panel--${snap.tier} mx-4 mb-1 rounded-2xl border px-3 py-2.5 text-center`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <span className="impact-zone-heart-wrap inline-flex">
          <Heart className="h-4 w-4 text-red-600 fill-red-500" aria-hidden />
        </span>
        <p className="text-sm font-extrabold text-red-800 leading-tight">
          {t(headlineKey, {
            lives: snap.livesLabel,
            donations: snap.donations,
          })}
        </p>
        {snap.livesSaved > 0 && (
          <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" aria-hidden />
        )}
      </div>

      <p className="text-[10px] font-semibold text-green-900 leading-snug">
        {t(bodyKey, {
          km: snap.radiusKm,
          reach: snap.reachLabel,
          donations: snap.donations,
          expand: snap.expandM ?? 0,
        })}
      </p>

      {snap.livesSaved > 0 && (
        <p className="mt-1 text-[9px] font-medium text-red-700/90 italic leading-snug">
          {t("mapImpactFeeling")}
        </p>
      )}
    </div>
  );
}
