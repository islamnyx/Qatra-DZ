import BloodTypeBadge from "./BloodTypeBadge";
import MatchScore from "./MatchScore";
import { formatTimeAgo } from "../mockData";
import { useLanguage } from "../context/LanguageContext";
import { Share2 } from "lucide-react";

export default function SOSBanner({ request, matchScore, onRespond, onShare, responded }) {
  const { t } = useLanguage();
  if (!request) return null;

  return (
    <div className={`rounded-2xl border border-red-300 bg-red-600 p-4 text-white sos-glow ${responded ? "opacity-80" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-bold uppercase">{t("sosUrgent")}</span>
        </div>
        <MatchScore score={matchScore} label={t("matchLabel")} />
      </div>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm text-red-100 mb-1">{t("bloodNeeded")}</p>
          <BloodTypeBadge type={request.bloodType} />
        </div>
        <span className="text-xs text-red-100">{formatTimeAgo(request.postedAt)}</span>
      </div>
      <p className="font-semibold text-sm mb-0.5">{request.hospital}</p>
      <p className="text-xs text-red-100 mb-4">{request.wilaya}</p>
      {responded ? (
        <p className="w-full rounded-xl bg-white/20 py-2.5 text-center text-sm font-bold">✓ تم الاستجابة</p>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={onRespond} className="flex-1 rounded-xl bg-white py-2.5 text-sm font-bold text-red-700">
            {t("respondNow")}
          </button>
          <button type="button" onClick={onShare} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white/10">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
