import { X, QrCode, Users, Calendar } from "lucide-react";
import BloodTypeBadge from "../../../components/BloodTypeBadge";
import { useLanguage } from "../../../context/LanguageContext";
import { formatDriveWindow, getDriveStatus } from "../utils/driveStatus";

export default function DriveSheet({ drive, onClose, onImComing, coming }) {
  const { t, lang } = useLanguage();
  if (!drive) return null;

  const status = getDriveStatus(drive);
  const live = status === "live";

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-t-3xl border border-blue-100 bg-white p-5 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{drive.nameAr}</h2>
            <p className="text-xs text-gray-500">{drive.nameFr}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              live ? "bg-blue-600 text-white animate-pulse" : "bg-indigo-100 text-indigo-800"
            }`}
          >
            {live ? t("mapDriveLive") : t("mapDriveUpcoming")}
          </span>
          {drive.qrCheckIn && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 flex items-center gap-1">
              <QrCode className="h-3.5 w-3.5" /> {t("mapQrEnabled")}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-blue-600" />
          {formatDriveWindow(drive, lang)}
        </p>

        <p className="text-xs font-semibold text-gray-500 mb-2">{t("mapBloodNeeded")}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {drive.bloodTypesNeeded.map((bt) => (
            <BloodTypeBadge key={bt} type={bt} />
          ))}
        </div>

        <p className="text-sm text-gray-700 flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-red-600" />
          {drive.volunteerCount + (coming ? 1 : 0)} {t("mapVolunteers")}
        </p>

        <button
          type="button"
          disabled={coming || status === "past"}
          onClick={onImComing}
          className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white min-h-[52px] disabled:opacity-60 active:scale-[0.98]"
        >
          {coming ? t("mapImComingDone") : t("mapImComing")}
        </button>
      </div>
    </div>
  );
}
