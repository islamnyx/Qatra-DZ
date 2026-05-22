import { X, Phone, Navigation, Clock, MapPin, Loader2 } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { formatDistance, navigationUrl } from "../utils/geo";
import { estimateWalkMin } from "../utils/routing";
import { formatHoursRange, isOpenNow } from "../utils/hours";

export default function CenterSheet({
  center,
  isEligible,
  onClose,
  onNavigate,
  userPosition,
  showRoute,
  routeInfo,
  routeLoading,
  onToggleRoute,
}) {
  const { t, lang } = useLanguage();
  if (!center) return null;

  const open = isOpenNow(center.hours);
  const hasRoadDistance = Boolean(userPosition && center.distanceKm != null);
  const km = center.distanceKm ?? 0;
  const driveMin =
    center.driveDurationMin ??
    routeInfo?.durationMin ??
    Math.max(1, Math.round((km / 25) * 60));
  const walkMin = estimateWalkMin(km);
  const distancePending = Boolean(userPosition && !center.distanceSource);

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-3xl border border-red-100 bg-white p-5 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{center.nameAr}</h2>
            <p className="text-xs text-gray-500">{center.nameFr}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-100"
            aria-label={t("cancel")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {distancePending ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-label={t("mapRouteLoading")} />
            ) : (
              formatDistance(km, lang)
            )}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              open ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {open ? t("mapOpenNow") : t("mapClosed")}
          </span>
          {!isEligible && (
            <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-700 flex items-center gap-1">
              🔒 {t("mapLocked")}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-red-600" />
          {formatHoursRange(center.hours)}
        </p>

        {hasRoadDistance && !distancePending && (
          <p className="text-xs text-gray-500 mb-3">
            {t("mapWalk")} ~{walkMin} {t("mapMin")} · {t("mapDrive")} ~{driveMin} {t("mapMin")}
            {center.distanceSource === "roads" && (
              <span className="text-gray-400"> · {t("mapRouteByRoad")}</span>
            )}
            {center.distanceSource === "straight" && (
              <span className="block mt-0.5 text-amber-600">{t("mapRouteFallback")}</span>
            )}
          </p>
        )}

        {showRoute && routeLoading && (
          <p className="text-xs text-red-600 font-medium mb-3">{t("mapRouteLoading")}</p>
        )}

        <div className="flex flex-col gap-2">
          <a
            href={`tel:${center.phone}`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-700 min-h-[48px]"
          >
            <Phone className="h-4 w-4" />
            {center.phone}
          </a>
          <button
            type="button"
            onClick={() => {
              onToggleRoute?.();
            }}
            className="rounded-2xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 min-h-[48px]"
          >
            {showRoute ? t("mapHideRoute") : t("mapShowRoute")}
          </button>
          {!isEligible && (
            <p className="text-xs text-gray-600 text-center px-1">{t("mapLockedNavigate")}</p>
          )}
          <button
            type="button"
            disabled={!isEligible}
            onClick={() => {
              if (!isEligible) return;
              window.open(
                navigationUrl(
                  center.lat,
                  center.lng,
                  center.nameFr,
                  userPosition?.[0],
                  userPosition?.[1]
                ),
                "_blank"
              );
              onNavigate?.();
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white min-h-[48px] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Navigation className="h-4 w-4" />
            {isEligible ? t("mapNavigate") : t("mapLocked")}
          </button>
        </div>
      </div>
    </div>
  );
}
