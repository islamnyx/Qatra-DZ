import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import BottomNav from "../components/BottomNav";
import BackHeader from "../components/BackHeader";
import BloodTypeBadge from "../components/BloodTypeBadge";
import { getPassportPayload } from "../mockData";
import { useLanguage } from "../context/LanguageContext";
import { useDonor } from "../context/DonorContext";
import { data } from "../services/data/index.js";
import { ShieldCheck, ScanLine, Calendar, MapPin } from "lucide-react";

export default function Passport() {
  const { t, lang } = useLanguage();
  const { donor, loading: donorLoading } = useDonor();
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    data
      .getPassport()
      .then(setPayload)
      .catch(() => setPayload(getPassportPayload()))
      .finally(() => setLoading(false));
  }, []);

  if (donorLoading || loading || !donor || !payload) {
    return (
      <div className="mx-auto min-h-screen max-w-sm bg-red-50 flex items-center justify-center">
        <p className="text-red-600 font-semibold">...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-sm bg-red-50 pb-24">
      <BackHeader title={t("passportTitle")} subtitle={t("passportSubtitle")} />
      <main className="px-4 py-4 space-y-4">
        <section className="rounded-2xl border-2 border-red-200 bg-white p-5 text-center animate-scale-in">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-red-600" />
            <span className="text-xs font-bold text-red-700 uppercase">{t("verified")}</span>
          </div>
          <div className="mx-auto inline-block rounded-2xl border-4 border-red-100 p-4 mb-4">
            <QRCodeSVG value={JSON.stringify(payload)} size={180} level="M" fgColor="#b91c1c" bgColor="#ffffff" />
          </div>
          <p className="text-sm font-bold flex items-center justify-center gap-2">
            <ScanLine className="h-4 w-4 text-red-600" /> {t("scanAtHospital")}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-mono">{payload.passportId}</p>
        </section>
        <section className="rounded-2xl border border-red-100 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">{donor.name}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" /> {donor.wilaya}</p>
            </div>
            <BloodTypeBadge type={donor.bloodType} size="lg" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border border-red-50 bg-red-50/50 p-3">
              <p className="text-xs text-gray-500">{t("donorId")}</p>
              <p className="font-bold text-red-700">{donor.id}</p>
            </div>
            <div className="rounded-xl border border-red-50 bg-red-50/50 p-3">
              <p className="text-xs text-gray-500">{t("eligibility")}</p>
              <p className="font-bold text-red-700">{donor.isEligible ? t("ready") : `${donor.daysUntilEligible}d`}</p>
            </div>
            <div className="col-span-2 rounded-xl border border-red-50 bg-red-50/50 p-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-500">{t("lastDonation")}</p>
                <p className="font-semibold">{donor.lastDonation}</p>
              </div>
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-red-100 bg-red-600 p-4 text-white text-sm">
          <p className="font-bold mb-1">CRA · Qatra</p>
          <p className="text-xs text-red-100 leading-relaxed">
            {lang === "fr" ? "Scan QR — identité et éligibilité sans formulaire." : "امسح الرمز — تحقق فوري بدون استمارات."}
          </p>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
