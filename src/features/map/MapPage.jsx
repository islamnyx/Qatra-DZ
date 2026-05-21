import { useState, useEffect, useCallback, useMemo } from "react";
import BottomNav from "../../components/BottomNav";
import LanguageToggle from "../../components/LanguageToggle";
import RespondSuccess from "../../components/RespondSuccess";
import { useLanguage } from "../../context/LanguageContext";
import { useDonor } from "../../context/DonorContext";
import { useApp } from "../../context/AppContext";
import { fetchDonorMapData, getQrHighlightDrive } from "./api/mapService";
import DonorMap, { MapLegendChip, RouteSummary } from "./components/DonorMap";
import EligibilityBanner from "./components/EligibilityBanner";
import CenterSheet from "./components/CenterSheet";
import DriveSheet from "./components/DriveSheet";
import EmergencySheet from "./components/EmergencySheet";
import { ALGER_CENTER } from "./mock/mapData";
import { formatDistance } from "./utils/geo";
import { MapPin, Locate, QrCode, Loader2 } from "lucide-react";
import "./map.css";

const COMING_KEY = "qatra_drive_coming";
const QR_PASSPORT_KEY = "qatra_passport_viewed";

export default function MapPage() {
  const { t, lang } = useLanguage();
  const { donor, loading: donorLoading } = useDonor();
  const { respondToSos, hasResponded, showSuccess, clearSuccess } = useApp();

  const [userPosition, setUserPosition] = useState(null);
  const [locStatus, setLocStatus] = useState("idle");
  const [mapData, setMapData] = useState({ centers: [], drives: [], emergencies: [] });
  const [mapLoading, setMapLoading] = useState(true);

  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [routeCenterId, setRouteCenterId] = useState(null);
  const [comingDrives, setComingDrives] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(COMING_KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  const hasQrPassport =
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem(QR_PASSPORT_KEY) === "1";

  const loadMapData = useCallback(async (lat, lng) => {
    setMapLoading(true);
    try {
      const data = await fetchDonorMapData(lat, lng);
      setMapData(data);
    } finally {
      setMapLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocStatus("unsupported");
      setUserPosition(ALGER_CENTER);
      loadMapData(ALGER_CENTER[0], ALGER_CENTER[1]);
      return;
    }
    setLocStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(p);
        setLocStatus("ok");
        loadMapData(p[0], p[1]);
      },
      () => {
        setLocStatus("denied");
        setUserPosition(ALGER_CENTER);
        loadMapData(ALGER_CENTER[0], ALGER_CENTER[1]);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }, [loadMapData]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const qrHighlightDrive = useMemo(() => {
    if (!hasQrPassport) return null;
    const lat = userPosition?.[0];
    const lng = userPosition?.[1];
    return getQrHighlightDrive(mapData.drives, lat, lng);
  }, [mapData.drives, userPosition, hasQrPassport]);

  const routeTarget = useMemo(() => {
    if (!routeCenterId) return null;
    return mapData.centers.find((c) => c.id === routeCenterId) ?? null;
  }, [routeCenterId, mapData.centers]);

  const markComing = (driveId) => {
    setComingDrives((prev) => {
      const next = prev.includes(driveId) ? prev : [...prev, driveId];
      sessionStorage.setItem(COMING_KEY, JSON.stringify(next));
      return next;
    });
  };

  if (donorLoading || !donor) {
    return (
      <div className="mx-auto min-h-screen max-w-sm bg-red-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  const isEligible = donor.isEligible;

  return (
    <div className="mx-auto min-h-screen max-w-sm bg-red-50 pb-24 flex flex-col">
      <header className="border-b border-red-100 bg-white px-4 py-3 sticky top-0 z-20 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-5 w-5 text-red-600 shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base font-bold text-red-700 truncate">{t("mapDonorTitle")}</h1>
              <p className="text-[10px] text-gray-500 truncate">{t("mapDonorSubtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={requestLocation}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-700"
              aria-label={t("mapMyLocation")}
            >
              <Locate className={`h-5 w-5 ${locStatus === "loading" ? "animate-pulse" : ""}`} />
            </button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div className="py-2 shrink-0 z-10">
        <EligibilityBanner isEligible={isEligible} daysUntilEligible={donor.daysUntilEligible} />
      </div>

      {qrHighlightDrive && (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 shrink-0">
          <QrCode className="h-4 w-4 shrink-0" />
          <span>
            {t("mapQrNearest")}: {lang === "fr" ? qrHighlightDrive.nameFr : qrHighlightDrive.nameAr}
            {qrHighlightDrive.distanceKm != null && (
              <> ({formatDistance(qrHighlightDrive.distanceKm, lang)})</>
            )}
          </span>
        </div>
      )}

      {locStatus === "denied" && (
        <p className="text-center text-[10px] text-gray-500 px-4 mb-1">{t("mapLocationDenied")}</p>
      )}

      <div className="relative flex-1 min-h-0 px-0">
        {mapLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : (
          <DonorMap
            userPosition={userPosition}
            centers={mapData.centers}
            drives={mapData.drives}
            emergencies={mapData.emergencies}
            isEligible={isEligible}
            selectedCenter={selectedCenter}
            selectedDrive={selectedDrive}
            selectedEmergency={selectedEmergency}
            routeTarget={routeTarget}
            qrHighlightDriveId={qrHighlightDrive?.id}
            onSelectCenter={(c) => {
              setSelectedDrive(null);
              setSelectedEmergency(null);
              setSelectedCenter(c);
            }}
            onSelectDrive={(d) => {
              setSelectedCenter(null);
              setSelectedEmergency(null);
              setSelectedDrive(d);
            }}
            onSelectEmergency={(a) => {
              setSelectedCenter(null);
              setSelectedDrive(null);
              setSelectedEmergency(a);
            }}
          />
        )}

        <div className="absolute bottom-2 left-0 right-0 z-[400] flex flex-wrap justify-center gap-1.5 px-2 pointer-events-none">
          <MapLegendChip label={t("mapLegendCenters")} color="#dc2626" />
          <MapLegendChip label={t("mapLegendDrives")} color="#2563eb" />
          <MapLegendChip label={t("mapLegendEmergency")} color="#ea580c" />
        </div>
      </div>

      {routeTarget && (
        <RouteSummary center={routeTarget} lang={lang} t={t} />
      )}

      <CenterSheet
        center={selectedCenter}
        isEligible={isEligible}
        onClose={() => setSelectedCenter(null)}
        showRoute={routeCenterId === selectedCenter?.id}
        onToggleRoute={() => {
          if (selectedCenter) {
            setRouteCenterId((id) => (id === selectedCenter.id ? null : selectedCenter.id));
          }
        }}
      />

      <DriveSheet
        drive={selectedDrive}
        onClose={() => setSelectedDrive(null)}
        coming={selectedDrive && comingDrives.includes(selectedDrive.id)}
        onImComing={() => selectedDrive && markComing(selectedDrive.id)}
      />

      <EmergencySheet
        alert={selectedEmergency}
        onClose={() => setSelectedEmergency(null)}
        helped={selectedEmergency && hasResponded(selectedEmergency.sosId)}
        onCanHelp={() => {
          if (selectedEmergency) {
            respondToSos(selectedEmergency.sosId, "30");
          }
        }}
      />

      {showSuccess && <RespondSuccess onClose={clearSuccess} />}

      <BottomNav />
    </div>
  );
}
