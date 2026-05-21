import { useState, useEffect } from "react";
import BottomNav from "../../components/BottomNav";
import BloodTypeBadge from "../../components/BloodTypeBadge";
import WilayaSheet from "./components/WilayaSheet";
import LanguageToggle from "../../components/LanguageToggle";
import { useLanguage } from "../../context/LanguageContext";
import { fetchWilayas } from "./api/mapService";
import { MapPin, AlertTriangle } from "lucide-react";

export default function MapPage() {
  const { t } = useLanguage();
  const [wilayas, setWilayas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWilayas()
      .then(setWilayas)
      .finally(() => setLoading(false));
  }, []);

  const criticalCount = wilayas.filter((w) => w.status === "critical").length;

  return (
    <div className="mx-auto min-h-screen max-w-sm bg-red-50 pb-24">
      <header className="border-b border-red-100 bg-white px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-600" />
            <div>
              <h1 className="text-lg font-bold text-red-700">{t("mapTitle")}</h1>
              <p className="text-xs text-gray-500">{t("mapSoon")}</p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>
      <main className="px-4 py-4 space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-600 p-4 text-white">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p className="font-bold text-sm">{criticalCount} ولايات في نقص حرج</p>
          </div>
        </div>
        {/* Map team: replace this placeholder with Leaflet / Mapbox / Google Maps */}
        <div className="rounded-2xl border border-red-100 bg-white p-5 text-center" data-map-slot="interactive-map">
          <MapPin className="mx-auto h-12 w-12 text-red-300 mb-2" />
          <p className="text-sm font-bold text-red-700">{t("mapSoon")}</p>
        </div>
        {loading && <p className="text-center text-sm text-gray-500">...</p>}
        <div className="grid grid-cols-2 gap-3">
          {wilayas.map((wilaya) => {
            const isCritical = wilaya.status === "critical";
            return (
              <button
                key={wilaya.name}
                type="button"
                onClick={() => setSelected(wilaya)}
                className={`rounded-2xl border p-3 text-start active:scale-95 ${isCritical ? "border-red-300 bg-red-50" : "border-green-200 bg-green-50"}`}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-sm">{wilaya.nameAr}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${isCritical ? "bg-red-600 animate-pulse" : "bg-green-500"}`} />
                </div>
                <p className="text-xs text-gray-500 mb-2">{wilaya.name}</p>
                {isCritical ? (
                  <>
                    <p className="text-xs font-semibold text-red-700 mb-1">{t("critical")}</p>
                    {wilaya.shortage && <BloodTypeBadge type={wilaya.shortage} />}
                  </>
                ) : (
                  <p className="text-xs font-semibold text-green-700">{t("ok")}</p>
                )}
              </button>
            );
          })}
        </div>
      </main>
      <BottomNav />
      {selected && <WilayaSheet wilaya={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
